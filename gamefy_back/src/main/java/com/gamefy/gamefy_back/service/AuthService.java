package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${google.client.id}")
    private String googleClientId;

    public User signup(String firstName, String lastName, String email, String password) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Encrypt password
        user.setRole(Roles.ADMIN);
        
        // Save and return the user
        return userRepository.save(user);
    }


    public Map<String, String> login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate tokens
        return generateAuthResponse(user);
    }

    public Map<String, String> loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String firstName = (String) payload.get("given_name");
                String lastName = (String) payload.get("family_name");

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFirstName(firstName != null ? firstName : "Google");
                    newUser.setLastName(lastName != null ? lastName : "User");
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for OAuth users
                    newUser.setRole(Roles.ADMIN); // Default role for social login
                    return userRepository.save(newUser);
                });

                return generateAuthResponse(user);
            } else {
                throw new BadCredentialsException("Invalid Google ID token");
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Could not verify Google ID token: " + e.getMessage());
        }
    }

    private Map<String, String> generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        tokens.put("userId", user.getId().toString());
        return tokens;
    }

    //generate a token and send it to email
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPwdToken(token);
        userRepository.save(user);

        emailService.sendResetPasswordEmail(email, token);
    }
    //change new password
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPwdToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPwdToken(null);
        userRepository.save(user);
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
