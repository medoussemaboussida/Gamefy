package com.gamefy.gamefy_back.dto;

import lombok.Data;

public class TwoFaDto {

    @Data
    public static class VerifyTwoFaRequest {
        private Integer userId;
        private String code;
    }

    @Data
    public static class ToggleTwoFaRequest {
        private boolean enabled;
    }
}
