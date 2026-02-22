package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachProfileDto {
    private Integer id;
    private Integer coachId;
    private String firstName;
    private String lastName;
    private String game;
    private Double hourlyPrice;
    private String bio;
}
