package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDto {
    private String firstName;
    private String lastName;
    private String email;
    private Roles role;
}
