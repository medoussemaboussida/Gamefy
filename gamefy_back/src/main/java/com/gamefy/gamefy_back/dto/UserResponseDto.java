package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private Roles role;
    private UserStatus status;
    private String profilePhoto;
    private Integer packGamefyId;
}
