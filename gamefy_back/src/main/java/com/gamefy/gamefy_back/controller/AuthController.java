package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequestMapping("/gamefy/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService service;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupDto request) {
        try {
            User user = service.signup(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword(),
                request.getRecaptchaToken()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            if ("Email already exists".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/signup/coach")
    public ResponseEntity<?> signupCoach(@Valid @RequestBody SignupDto request) {
        try {
            User user = service.signupCoach(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword(),
                request.getRecaptchaToken()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            if ("Email already exists".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginDto request,
            HttpServletResponse response) {
        
        // Authenticate and generate tokens
        Map<String, String> tokens = service.login(request.getEmail(), request.getPassword());
        
        // Check if 2FA is required
        if ("true".equals(tokens.get("requires2FA"))) {
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMessage("2FA verification required");
            loginResponse.setRequires2FA(true);
            loginResponse.setUserId(Integer.parseInt(tokens.get("userId")));
            return ResponseEntity.ok(loginResponse);
        }
        
        // Create HttpOnly cookie for refresh token
        Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(refreshTokenCookie);
        
        // Return access token, role and userId in response body
        User user = service.getUserByEmail(request.getEmail());
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setMessage("Login Successful");
        loginResponse.setAccessToken(tokens.get("accessToken"));
        loginResponse.setRole(user.getRole().name());
        loginResponse.setUserId(user.getId());
        loginResponse.setTwoFaActivated(user.isTwoFaActivated());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordDto request) {
        service.forgotPassword(request.getEmail(), request.getClientUrl());
        return ResponseEntity.ok(Map.of("message", "Reset link sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordDto request) {
        service.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(
            @RequestBody GoogleLoginDto request,
            HttpServletResponse response) {
        
        Map<String, String> tokens = service.loginWithGoogle(request.getIdToken());
        
        // Create HttpOnly cookie for refresh token
        Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true in production
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(refreshTokenCookie);
        
        // Fetch user and return response
        User user = service.getUserById(Integer.parseInt(tokens.get("userId")));
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setMessage("Google Login Successful");
        loginResponse.setAccessToken(tokens.get("accessToken"));
        loginResponse.setRole(user.getRole().name());
        loginResponse.setUserId(user.getId());
        loginResponse.setTwoFaActivated(user.isTwoFaActivated());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        
        log.info("Refresh token request received");
        if (refreshToken == null) {
            log.warn("Refresh token cookie missing");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Map<String, String> tokens = service.refreshToken(refreshToken);
            User user = service.getUserById(Integer.parseInt(tokens.get("userId")));
            log.info("Token successfully refreshed for user ID: {}", user.getId());
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMessage("Token Refreshed");
            loginResponse.setAccessToken(tokens.get("accessToken"));
            loginResponse.setRole(user.getRole().name());
            loginResponse.setUserId(user.getId());
            loginResponse.setTwoFaActivated(user.isTwoFaActivated());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // Delete the cookie
        response.addCookie(cookie);
        
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verifyTwoFa(
            @RequestBody TwoFaDto.VerifyTwoFaRequest request,
            HttpServletResponse response) {
        try {
            Map<String, String> tokens = service.verifyTwoFa(request.getUserId(), request.getCode());
            
            // Create HttpOnly cookie for refresh token
            Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(false);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(refreshTokenCookie);
            
            User user = service.getUserById(request.getUserId());
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMessage("2FA Verified");
            loginResponse.setAccessToken(tokens.get("accessToken"));
            loginResponse.setRole(user.getRole().name());
            loginResponse.setUserId(user.getId());
            loginResponse.setTwoFaActivated(user.isTwoFaActivated());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse());
        }
    }

    @PostMapping("/toggle-2fa")
    public ResponseEntity<Map<String, String>> toggleTwoFa(
            @RequestBody TwoFaDto.ToggleTwoFaRequest request,
            @RequestHeader("userId") Integer userId) {
        try {
            service.toggleTwoFa(userId, request.isEnabled());
            String msg = request.isEnabled() ? "2FA enabled successfully" : "2FA disabled successfully";
            return ResponseEntity.ok(Map.of("message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

}
