package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.exception.UserExceptions.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import com.gamefy.gamefy_back.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpResponse;
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
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final RecaptchaService recaptchaService;

    @Value("${google.client.id}")
    private String googleClientId;

    public User signup(String firstName, String lastName, String email, String password, String recaptchaToken) {
        if (!recaptchaService.verifyToken(recaptchaToken)) {
            throw new RecaptchaException("Invalid reCAPTCHA token");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException(email);
        }
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Encrypt password
        user.setRole(Roles.PLAYER);
        user.setStatus(UserStatus.ACTIVE);
        
        // Save and return the user
        return userRepository.save(user);
    }

    public User signupCoach(String firstName, String lastName, String email, String password, String recaptchaToken) {
        if (!recaptchaService.verifyToken(recaptchaToken)) {
            throw new RecaptchaException("Invalid reCAPTCHA token");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException(email);
        }
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Encrypt password
        user.setRole(Roles.COACH);
        user.setStatus(UserStatus.INACTIVE); // Coach is inactive by default waiting for approval

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

        // Check if 2FA is activated
        if (user.isTwoFaActivated()) {
            // Generate a 6-digit code
            String code = String.format("%06d", new Random().nextInt(999999));
            user.setTwoFaToken(code);
            userRepository.save(user);

            // Send the code via email
            emailService.send2FACode(user.getEmail(), code);

            Map<String, String> response = new HashMap<>();
            response.put("requires2FA", "true");
            response.put("userId", user.getId().toString());
            return response;
        }

        // Generate tokens
        return generateAuthResponse(user);
    }

    public Map<String, String> loginWithGoogle(String token) {
        try {
            String email;
            String firstName;
            String lastName;

            if (token != null && token.split("\\.").length == 3) {
                // ID Token Flow
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(token);
                if (idToken != null) {
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    email = payload.getEmail();
                    firstName = (String) payload.get("given_name");
                    lastName = (String) payload.get("family_name");
                } else {
                    throw new BadCredentialsException("Invalid Google ID token");
                }
            } else {
                // Access Token Flow (for custom buttons)
                HttpRequest request = new NetHttpTransport().createRequestFactory()
                        .buildGetRequest(new GenericUrl("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token));
                HttpResponse response = request.execute();
                Map<String, Object> payload = new GsonFactory().createJsonParser(response.getContent()).parseAndClose(Map.class);
                
                email = (String) payload.get("email");
                firstName = (String) payload.get("given_name");
                lastName = (String) payload.get("family_name");
            }

            if (email == null) {
                throw new BadCredentialsException("Could not retrieve email from Google");
            }

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFirstName(firstName != null ? firstName : "Google");
                newUser.setLastName(lastName != null ? lastName : "User");
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole(Roles.PLAYER); // Default to PLAYER for front-office users
                newUser.setStatus(UserStatus.ACTIVE);
                return userRepository.save(newUser);
            });

            return generateAuthResponse(user);
        } catch (Exception e) {
            throw new BadCredentialsException("Could not verify Google account: " + e.getMessage());
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
    public void forgotPassword(String email, String clientUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPwdToken(token);
        userRepository.save(user);

        if (clientUrl != null && clientUrl.contains("5174")) {
            emailService.sendFrontOfficeResetEmail(email, token);
        } else {
            emailService.sendBackOfficeResetEmail(email, token);
        }
    }
    //change new password
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPwdToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPwdToken(null);
        userRepository.save(user);
    }

    public Map<String, String> refreshToken(String refreshToken) {
        if (jwtService.validateToken(refreshToken) && jwtService.isRefreshToken(refreshToken)) {
            String email = jwtService.extractEmail(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException(email));
            
            String newAccessToken = jwtService.generateAccessToken(user);
            
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", newAccessToken);
            tokens.put("userId", user.getId().toString());
            return tokens;
        }
        throw new InvalidTokenException("Invalid or expired refresh token");
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    /**
     * Get user by ID
     */
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Verify the 2FA code and return auth tokens
     */
    public Map<String, String> verifyTwoFa(Integer userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.getTwoFaToken() == null || !user.getTwoFaToken().equals(code)) {
            throw new BadCredentialsException("Invalid 2FA code");
        }

        // Clear the token after successful verification
        user.setTwoFaToken(null);
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    /**
     * Toggle 2FA on or off for a user
     */
    public void toggleTwoFa(Integer userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setTwoFaActivated(enabled);
        if (!enabled) {
            user.setTwoFaToken(null);
        }
        userRepository.save(user);
    }

}
