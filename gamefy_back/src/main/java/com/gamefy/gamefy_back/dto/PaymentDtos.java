package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PaymentDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackPaymentRequest {
        private Integer packId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackConfirmRequest {
        private Integer packId;
        private String paymentIntentId; // Used for reference/logging
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentIntentResponse {
        private String clientSecret;
        private String publishableKey;
    }
}
