package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileDto {
    private String firstName;
    private String lastName;
    private String password;
    private String profilePhoto;
}
