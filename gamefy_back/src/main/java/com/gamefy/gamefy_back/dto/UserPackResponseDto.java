package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPackResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private UserPackStatus status;
}
