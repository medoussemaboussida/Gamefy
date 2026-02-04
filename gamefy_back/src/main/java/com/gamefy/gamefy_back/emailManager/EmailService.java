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

    private void sendResetEmail(String to, String token, String baseUrl) {
        String resetLink = baseUrl + "/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n" + resetLink);
        
        mailSender.send(message);
    }
}
