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

    public void sendAccountDeletedEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Account Deactivation Notice - Gamefy");
        message.setText("Hello,\n\n" +
                "We are writing to inform you that your account on Gamefy has been removed by an administrator.\n" +
                "Your account is no longer available for use.\n\n" +
                "If you believe this is a mistake, please contact support.");
        
        mailSender.send(message);
    }

    public void sendAccountActivatedEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Account Activated - Gamefy");
        message.setText("Hello,\n\n" +
                "Great news! Your account on Gamefy has been activated by an administrator.\n" +
                "You can now access all features and services.\n\n" +
                "Welcome to Gamefy!");
        
        mailSender.send(message);
    }

    public void sendAccountDisabledEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Account Disabled - Gamefy");
        message.setText("Hello,\n\n" +
                "We are writing to inform you that your account on Gamefy has been disabled by an administrator.\n" +
                "You will not be able to access your account until it is reactivated.\n\n" +
                "If you believe this is a mistake, please contact support.");
        
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
