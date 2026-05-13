package com.gamefy.gamefy_back.emailManager;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
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
                "An account has been created for you.\n" +
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

    public void send2FACode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Gamefy 2FA Verification Code");
        message.setText("Your two-factor authentication code is:\n\n" +
                code + "\n\n" +
                "This code will expire when you log in again.\n" +
                "If you did not request this, please ignore this email.");

        mailSender.send(message);
    }

    @Async
    public void sendEventParticipationEmail(String to, String firstName, String lastName, String eventTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Event Registration Confirmed - " + eventTitle);
        message.setText("Hello " + firstName + " " + lastName + ",\n\n" +
                "You have successfully registered for the event: " + eventTitle + ".\n\n" +
                "Please visit the Gamefy local place to complete your payment.\n" +
                "You can find the price details in the event description.\n\n" +
                "We look forward to seeing you there!\n" +
                "The Gamefy Academy Team !");

        mailSender.send(message);
    }

    @Async
    public void sendEventCancellationEmail(String to, String firstName, String lastName, String eventTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Event Participation Cancelled - " + eventTitle);
        message.setText("Hello " + firstName + " " + lastName + ",\n\n" +
                "Your participation in the event: " + eventTitle + " has been cancelled.\n\n" +
                "If this was a mistake, you can re-register through the Gamefy platform.\n\n" +
                "The Gamefy Team !");

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
