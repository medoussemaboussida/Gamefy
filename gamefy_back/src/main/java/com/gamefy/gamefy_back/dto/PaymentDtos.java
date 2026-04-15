package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

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
    @Builder
    public static class AllPaymentResponse implements Serializable {
        private Integer id;
        private String userName;
        private String paidFor;
        private Double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentIntentResponse {
        private String clientSecret;
        private String publishableKey;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationPaymentRequest {
        private Integer reservationId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationConfirmRequest {
        private Integer reservationId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MyPackStatusResponse {
        private Integer packId;
        private String packName;
        private String status; // "ACTIVE", "EXPIRED", "CONSUMED"
    }
}
