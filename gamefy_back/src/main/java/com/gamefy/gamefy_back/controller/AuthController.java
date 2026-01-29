package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/gamefy/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupDto request) {
        User user = service.signup(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginDto request,
            HttpServletResponse response) {
        
        // Authenticate and generate tokens
        Map<String, String> tokens = service.login(request.getEmail(), request.getPassword());
        
        // Create HttpOnly cookie for refresh token
        Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(refreshTokenCookie);
        
        // Return access token in response body with a success message
        LoginResponse loginResponse = new LoginResponse("Login Successful", tokens.get("accessToken"));
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordDto request) {
        service.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Reset link sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordDto request) {
        service.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

}
