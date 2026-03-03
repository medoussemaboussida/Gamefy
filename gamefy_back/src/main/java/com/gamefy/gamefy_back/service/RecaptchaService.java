package com.gamefy.gamefy_back.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecaptchaService {

    @Value("${google.recaptcha.secret}")
    private String recaptchaSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        Map<String, String> body = new HashMap<>();
        body.put("secret", recaptchaSecret);
        body.put("response", token);

        try {
            RecaptchaResponse response = restTemplate.postForObject(
                    RECAPTCHA_VERIFY_URL + "?secret={secret}&response={response}",
                    null,
                    RecaptchaResponse.class,
                    body
            );

            return response != null && response.isSuccess();
        } catch (Exception e) {
            return false;
        }
    }

    @Data
    private static class RecaptchaResponse {
        private boolean success;
        private String challenge_ts;
        private String hostname;
    }
}
