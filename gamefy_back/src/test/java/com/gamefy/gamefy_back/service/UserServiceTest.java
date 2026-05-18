package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreateUserDto;
import com.gamefy.gamefy_back.dto.UpdateProfileDto;
import com.gamefy.gamefy_back.dto.UserResponseDto;
import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.exception.UserExceptions.EmailAlreadyExistsException;
import com.gamefy.gamefy_back.exception.UserExceptions.UserNotFoundException;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import com.gamefy.gamefy_back.repository.SubscriptionRepository;
import com.gamefy.gamefy_back.repository.UserPackCoachingRepository;
import com.gamefy.gamefy_back.repository.UserPackGamefyRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link UserService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock private UserRepository repository;
    @Mock private BCryptPasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private UserPackGamefyRepository userPackGamefyRepository;
    @Mock private UserPackCoachingRepository userPackCoachingRepository;
    @Mock private PackGamefyService packGamefyService;
    @Mock private PackCoachingService packCoachingService;

    @InjectMocks
    private UserService userService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User buildUser(Integer id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setFirstName("First");
        user.setLastName("Last");
        user.setRole(Roles.PLAYER);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }

    private void stubEmptyMappings() {
        given(subscriptionRepository.findByPlayerId(any())).willReturn(Optional.empty());
        given(userPackGamefyRepository.findByUserAndStatus(any(), any())).willReturn(Collections.emptyList());
        given(userPackGamefyRepository.findFirstByUserOrderByActivatedAtDesc(any())).willReturn(Optional.empty());
        given(userPackCoachingRepository.findByUserAndStatus(any(), any())).willReturn(Collections.emptyList());
        given(userPackCoachingRepository.findFirstByUserOrderByActivatedAtDesc(any())).willReturn(Optional.empty());
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  createUser()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createUser()")
    class CreateUser {

        @Test
        @DisplayName("✅ Admin creates user → generated password, email sent")
        void createUser_success() {
            CreateUserDto dto = new CreateUserDto("New", "User", "new@example.com", Roles.ADMIN);
            given(repository.findByEmail("new@example.com")).willReturn(Optional.empty());
            given(passwordEncoder.encode(anyString())).willReturn("hashedRandomPass");
            
            User savedUser = buildUser(10, "new@example.com");
            savedUser.setRole(Roles.ADMIN);
            given(repository.save(any(User.class))).willReturn(savedUser);
            stubEmptyMappings();

            UserResponseDto result = userService.createUser(dto);

            assertThat(result.getEmail()).isEqualTo("new@example.com");
            then(emailService).should().sendAdminCreationEmail(eq("new@example.com"), anyString(), eq("ADMIN"));
            then(repository).should().save(any(User.class));
        }

        @Test
        @DisplayName("❌ Email already exists → EmailAlreadyExistsException")
        void createUser_duplicateEmail_throws() {
            given(repository.findByEmail("taken@example.com")).willReturn(Optional.of(new User()));

            assertThatThrownBy(() -> userService.createUser(new CreateUserDto("A", "B", "taken@example.com", Roles.PLAYER)))
                    .isInstanceOf(EmailAlreadyExistsException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updateProfile()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateProfile()")
    class UpdateProfile {

        @Test
        @DisplayName("✅ Partial update (name and photo) → fields updated")
        void updateProfile_partialUpdate_success() {
            User existing = buildUser(1, "john@example.com");
            given(repository.findById(1)).willReturn(Optional.of(existing));
            given(repository.save(existing)).willReturn(existing);
            stubEmptyMappings();

            UpdateProfileDto dto = UpdateProfileDto.builder()
                    .firstName("NewName")
                    .profilePhoto("new-photo.png")
                    .build();

            UserResponseDto result = userService.updateProfile(1, dto);

            assertThat(existing.getFirstName()).isEqualTo("NewName");
            assertThat(existing.getProfilePhoto()).isEqualTo("new-photo.png");
            assertThat(result.getFirstName()).isEqualTo("NewName");
        }

        @Test
        @DisplayName("✅ Update password → encoded and saved")
        void updateProfile_passwordUpdate_success() {
            User existing = buildUser(1, "john@example.com");
            given(repository.findById(1)).willReturn(Optional.of(existing));
            given(passwordEncoder.encode("new-secret")).willReturn("hashed-secret");
            given(repository.save(existing)).willReturn(existing);
            stubEmptyMappings();

            UpdateProfileDto dto = UpdateProfileDto.builder()
                    .password("new-secret")
                    .build();

            userService.updateProfile(1, dto);

            assertThat(existing.getPassword()).isEqualTo("hashed-secret");
        }

        @Test
        @DisplayName("❌ User not found → UserNotFoundException")
        void updateProfile_notFound_throws() {
            given(repository.findById(999)).willReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateProfile(999, new UpdateProfileDto()))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updateUserStatus()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateUserStatus()")
    class UpdateUserStatus {

        @Test
        @DisplayName("✅ Enable user → Status ACTIVE, activation email sent")
        void enableUser_success() {
            User user = buildUser(1, "john@example.com");
            user.setStatus(UserStatus.INACTIVE);
            given(repository.findById(1)).willReturn(Optional.of(user));
            given(repository.save(user)).willReturn(user);
            stubEmptyMappings();

            userService.updateUserStatus(1L, true);

            assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
            then(emailService).should().sendAccountActivatedEmail("john@example.com");
        }

        @Test
        @DisplayName("✅ Disable user → Status INACTIVE, disabled email sent")
        void disableUser_success() {
            User user = buildUser(1, "john@example.com");
            user.setStatus(UserStatus.ACTIVE);
            given(repository.findById(1)).willReturn(Optional.of(user));
            given(repository.save(user)).willReturn(user);
            stubEmptyMappings();

            userService.updateUserStatus(1L, false);

            assertThat(user.getStatus()).isEqualTo(UserStatus.INACTIVE);
            then(emailService).should().sendAccountDisabledEmail("john@example.com");
        }
    }
}
