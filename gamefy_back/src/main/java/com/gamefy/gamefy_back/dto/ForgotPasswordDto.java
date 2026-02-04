package com.gamefy.gamefy_back.dto;

import lombok.Data;

@Data
public class ForgotPasswordDto {
    private String email;
    private String clientUrl;
}
