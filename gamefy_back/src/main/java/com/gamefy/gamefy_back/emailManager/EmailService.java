package com.gamefy.gamefy_back.emailManager;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendBackOfficeResetEmail(String to, String token) {
        sendResetEmail(to, token, "http://localhost:5173");
    }

    public void sendFrontOfficeResetEmail(String to, String token) {
        sendResetEmail(to, token, "http://localhost:5174");
    }

    public void sendAdminCreationEmail(String to, String password, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Account has been Created");
        message.setText("Welcome to Gamefy Academy team!\n\n" +
                "An administrative account has been created for you.\n" +
                "Email: " + to + "\n" +
                "Password: " + password + "\n" +
                "Your Role will be : " + role + "\n\n" +
                "Please log in to the Back-Office and change your password immediately.");
        
        mailSender.send(message);
    }

    private void sendResetEmail(String to, String token, String baseUrl) {
        String resetLink = baseUrl + "/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n" + resetLink);
        
        mailSender.send(message);
    }
}
