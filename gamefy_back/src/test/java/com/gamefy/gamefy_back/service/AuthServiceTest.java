package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.exception.UserExceptions.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import com.gamefy.gamefy_back.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link AuthService}.
 *
 * No Spring context loaded — all dependencies are mocked with Mockito.
 * Tests follow the Arrange / Act / Assert (AAA) pattern and use
 * AssertJ for expressive assertions.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    // ─── Mocks ──────────────────────────────────────────────────────────────
    @Mock private UserRepository      userRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;
    @Mock private JwtService           jwtService;
    @Mock private EmailService         emailService;
    @Mock private RecaptchaService     recaptchaService;

    @InjectMocks
    private AuthService authService;

    // ─── Helpers ─────────────────────────────────────────────────────────────
    /** Creates a minimal valid User object for use in test stubs. */
    private User buildUser(Integer id, String email, Roles role, UserStatus status) {
        User u = new User();
        ReflectionTestUtils.setField(u, "id", id);
        u.setFirstName("Test");
        u.setLastName("User");
        u.setEmail(email);
        u.setPassword("hashedPassword");
        u.setRole(role);
        u.setStatus(status);
        u.setTwoFaActivated(false);
        return u;
    }

    @BeforeEach
    void setUp() {
        // Inject the @Value field (not set by Mockito)
        ReflectionTestUtils.setField(authService, "googleClientId", "dummy-google-client-id");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  signup()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("signup()")
    class Signup {

        @Test
        @DisplayName("✅ Happy path — new player account created")
        void signup_success() {
            // Arrange
            given(recaptchaService.verifyToken("validToken")).willReturn(true);
            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.empty());
            given(passwordEncoder.encode("secret123")).willReturn("hashedSecret");

            User savedUser = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            given(userRepository.save(any(User.class))).willReturn(savedUser);

            // Act
            User result = authService.signup("John", "Doe", "john@example.com", "secret123", "validToken");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRole()).isEqualTo(Roles.PLAYER);
            assertThat(result.getStatus()).isEqualTo(UserStatus.ACTIVE);
            then(userRepository).should().save(any(User.class));
        }

        @Test
        @DisplayName("❌ Invalid reCAPTCHA token → RecaptchaException")
        void signup_invalidRecaptcha_throws() {
            given(recaptchaService.verifyToken("badToken")).willReturn(false);

            assertThatThrownBy(() ->
                    authService.signup("John", "Doe", "john@example.com", "pass", "badToken"))
                    .isInstanceOf(RecaptchaException.class)
                    .hasMessageContaining("Invalid reCAPTCHA");

            then(userRepository).shouldHaveNoInteractions();
        }

        @Test
        @DisplayName("❌ Email already taken → EmailAlreadyExistsException")
        void signup_emailAlreadyExists_throws() {
            given(recaptchaService.verifyToken("validToken")).willReturn(true);
            given(userRepository.findByEmail("taken@example.com"))
                    .willReturn(Optional.of(buildUser(2, "taken@example.com", Roles.PLAYER, UserStatus.ACTIVE)));

            assertThatThrownBy(() ->
                    authService.signup("Jane", "Doe", "taken@example.com", "pass", "validToken"))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining("taken@example.com");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  signupCoach()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("signupCoach()")
    class SignupCoach {

        @Test
        @DisplayName("✅ Coach created with INACTIVE status waiting for approval")
        void signupCoach_success_inactiveByDefault() {
            given(recaptchaService.verifyToken("validToken")).willReturn(true);
            given(userRepository.findByEmail("coach@example.com")).willReturn(Optional.empty());
            given(passwordEncoder.encode("pass")).willReturn("hashed");

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            User savedUser = buildUser(3, "coach@example.com", Roles.COACH, UserStatus.INACTIVE);
            given(userRepository.save(captor.capture())).willReturn(savedUser);

            User result = authService.signupCoach("Bob", "Smith", "coach@example.com", "pass", "validToken");

            assertThat(result.getRole()).isEqualTo(Roles.COACH);
            assertThat(result.getStatus()).isEqualTo(UserStatus.INACTIVE);
            // Verify the saved entity has COACH role and INACTIVE status
            assertThat(captor.getValue().getRole()).isEqualTo(Roles.COACH);
            assertThat(captor.getValue().getStatus()).isEqualTo(UserStatus.INACTIVE);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  login()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("✅ Correct credentials without 2FA → returns access + refresh tokens")
        void login_validCredentials_no2FA_returnsTokens() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaActivated(false);

            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("secret123", "hashedPassword")).willReturn(true);
            given(jwtService.generateAccessToken(user)).willReturn("access-jwt");
            given(jwtService.generateRefreshToken(user)).willReturn("refresh-jwt");

            Map<String, String> result = authService.login("john@example.com", "secret123");

            assertThat(result)
                    .containsEntry("accessToken", "access-jwt")
                    .containsEntry("refreshToken", "refresh-jwt")
                    .containsKey("userId");
        }

        @Test
        @DisplayName("✅ 2FA activated → sends email code, returns requires2FA flag")
        void login_with2FA_sendsCodeAndReturnsFlag() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaActivated(true);

            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("secret123", "hashedPassword")).willReturn(true);
            given(userRepository.save(any())).willReturn(user);

            Map<String, String> result = authService.login("john@example.com", "secret123");

            assertThat(result).containsEntry("requires2FA", "true");
            assertThat(result).containsKey("userId");
            then(emailService).should().send2FACode(eq("john@example.com"), anyString());
            then(jwtService).shouldHaveNoInteractions(); // no tokens issued until 2FA verified
        }

        @Test
        @DisplayName("❌ Email not found → BadCredentialsException")
        void login_userNotFound_throws() {
            given(userRepository.findByEmail("ghost@example.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login("ghost@example.com", "pass"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessageContaining("Invalid email or password");
        }

        @Test
        @DisplayName("❌ Wrong password → BadCredentialsException")
        void login_wrongPassword_throws() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("wrongPass", "hashedPassword")).willReturn(false);

            assertThatThrownBy(() -> authService.login("john@example.com", "wrongPass"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessageContaining("Invalid email or password");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  forgotPassword()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("forgotPassword()")
    class ForgotPassword {

        @Test
        @DisplayName("✅ Back-office URL → sends back-office reset email")
        void forgotPassword_backOfficeUrl_sendsBackOfficeEmail() {
            User user = buildUser(1, "admin@example.com", Roles.ADMIN, UserStatus.ACTIVE);
            given(userRepository.findByEmail("admin@example.com")).willReturn(Optional.of(user));
            given(userRepository.save(any())).willReturn(user);

            authService.forgotPassword("admin@example.com", "http://localhost:5173/reset");

            then(emailService).should().sendBackOfficeResetEmail(eq("admin@example.com"), anyString());
            then(emailService).should(never()).sendFrontOfficeResetEmail(any(), any());
        }

        @Test
        @DisplayName("✅ Front-office URL (port 5174) → sends front-office reset email")
        void forgotPassword_frontOfficeUrl_sendsFrontOfficeEmail() {
            User user = buildUser(1, "player@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            given(userRepository.findByEmail("player@example.com")).willReturn(Optional.of(user));
            given(userRepository.save(any())).willReturn(user);

            authService.forgotPassword("player@example.com", "http://localhost:5174/reset");

            then(emailService).should().sendFrontOfficeResetEmail(eq("player@example.com"), anyString());
            then(emailService).should(never()).sendBackOfficeResetEmail(any(), any());
        }

        @Test
        @DisplayName("❌ Email not found → UserNotFoundException")
        void forgotPassword_userNotFound_throws() {
            given(userRepository.findByEmail("nobody@example.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.forgotPassword("nobody@example.com", null))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  resetPassword()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("resetPassword()")
    class ResetPassword {

        @Test
        @DisplayName("✅ Valid token → password updated, token cleared")
        void resetPassword_validToken_updatesPassword() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setResetPwdToken("valid-reset-token");

            given(userRepository.findByResetPwdToken("valid-reset-token")).willReturn(Optional.of(user));
            given(passwordEncoder.encode("newPass123")).willReturn("hashedNew");
            given(userRepository.save(any())).willReturn(user);

            authService.resetPassword("valid-reset-token", "newPass123");

            assertThat(user.getPassword()).isEqualTo("hashedNew");
            assertThat(user.getResetPwdToken()).isNull();
        }

        @Test
        @DisplayName("❌ Invalid token → InvalidTokenException")
        void resetPassword_invalidToken_throws() {
            given(userRepository.findByResetPwdToken("bad-token")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resetPassword("bad-token", "newPass"))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("Invalid or expired reset token");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  refreshToken()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("refreshToken()")
    class RefreshToken {

        @Test
        @DisplayName("✅ Valid refresh token → returns new access token")
        void refreshToken_valid_returnsNewAccessToken() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);

            given(jwtService.validateToken("valid-refresh")).willReturn(true);
            given(jwtService.isRefreshToken("valid-refresh")).willReturn(true);
            given(jwtService.extractEmail("valid-refresh")).willReturn("john@example.com");
            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));
            given(jwtService.generateAccessToken(user)).willReturn("new-access-token");

            Map<String, String> result = authService.refreshToken("valid-refresh");

            assertThat(result)
                    .containsEntry("accessToken", "new-access-token")
                    .containsKey("userId");
        }

        @Test
        @DisplayName("❌ Invalid refresh token → InvalidTokenException")
        void refreshToken_invalid_throws() {
            given(jwtService.validateToken("bad-token")).willReturn(false);

            assertThatThrownBy(() -> authService.refreshToken("bad-token"))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("Invalid or expired refresh token");
        }

        @Test
        @DisplayName("❌ Token is valid JWT but not a refresh token → InvalidTokenException")
        void refreshToken_notARefreshToken_throws() {
            given(jwtService.validateToken("access-token")).willReturn(true);
            given(jwtService.isRefreshToken("access-token")).willReturn(false);

            assertThatThrownBy(() -> authService.refreshToken("access-token"))
                    .isInstanceOf(InvalidTokenException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  verifyTwoFa()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("verifyTwoFa()")
    class VerifyTwoFa {

        @Test
        @DisplayName("✅ Correct code → clears token, returns auth tokens")
        void verifyTwoFa_correctCode_returnsTokens() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaToken("123456");

            given(userRepository.findById(1)).willReturn(Optional.of(user));
            given(userRepository.save(any())).willReturn(user);
            given(jwtService.generateAccessToken(user)).willReturn("access");
            given(jwtService.generateRefreshToken(user)).willReturn("refresh");

            Map<String, String> result = authService.verifyTwoFa(1, "123456");

            assertThat(user.getTwoFaToken()).isNull(); // token must be cleared
            assertThat(result).containsKey("accessToken").containsKey("refreshToken");
        }

        @Test
        @DisplayName("❌ Wrong code → BadCredentialsException")
        void verifyTwoFa_wrongCode_throws() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaToken("123456");

            given(userRepository.findById(1)).willReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.verifyTwoFa(1, "000000"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessageContaining("Invalid 2FA code");
        }

        @Test
        @DisplayName("❌ No token stored (not expected) → BadCredentialsException")
        void verifyTwoFa_noTokenStored_throws() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaToken(null);

            given(userRepository.findById(1)).willReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.verifyTwoFa(1, "123456"))
                    .isInstanceOf(BadCredentialsException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  toggleTwoFa()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("toggleTwoFa()")
    class ToggleTwoFa {

        @Test
        @DisplayName("✅ Enable 2FA → twoFaActivated = true")
        void toggleTwoFa_enable() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaActivated(false);

            given(userRepository.findById(1)).willReturn(Optional.of(user));
            given(userRepository.save(any())).willReturn(user);

            authService.toggleTwoFa(1, true);

            assertThat(user.isTwoFaActivated()).isTrue();
        }

        @Test
        @DisplayName("✅ Disable 2FA → clears token and sets twoFaActivated = false")
        void toggleTwoFa_disable_clearsToken() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            user.setTwoFaActivated(true);
            user.setTwoFaToken("123456");

            given(userRepository.findById(1)).willReturn(Optional.of(user));
            given(userRepository.save(any())).willReturn(user);

            authService.toggleTwoFa(1, false);

            assertThat(user.isTwoFaActivated()).isFalse();
            assertThat(user.getTwoFaToken()).isNull();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getUserByEmail() / getUserById()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getUserByEmail() / getUserById()")
    class GetUser {

        @Test
        @DisplayName("✅ getUserByEmail — found")
        void getUserByEmail_found() {
            User user = buildUser(1, "john@example.com", Roles.PLAYER, UserStatus.ACTIVE);
            given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));

            User result = authService.getUserByEmail("john@example.com");

            assertThat(result.getEmail()).isEqualTo("john@example.com");
        }

        @Test
        @DisplayName("❌ getUserByEmail — not found → UserNotFoundException")
        void getUserByEmail_notFound_throws() {
            given(userRepository.findByEmail("ghost@example.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUserByEmail("ghost@example.com"))
                    .isInstanceOf(UserNotFoundException.class);
        }

        @Test
        @DisplayName("✅ getUserById — found")
        void getUserById_found() {
            User user = buildUser(99, "admin@example.com", Roles.ADMIN, UserStatus.ACTIVE);
            given(userRepository.findById(99)).willReturn(Optional.of(user));

            User result = authService.getUserById(99);

            assertThat(result.getEmail()).isEqualTo("admin@example.com");
        }

        @Test
        @DisplayName("❌ getUserById — not found → UserNotFoundException")
        void getUserById_notFound_throws() {
            given(userRepository.findById(999)).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUserById(999))
                    .isInstanceOf(UserNotFoundException.class)
                    .hasMessageContaining("999");
        }
    }
}
