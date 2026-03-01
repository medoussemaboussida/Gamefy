package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPackDto {
    private Integer userId;
    private Integer packId;
}
