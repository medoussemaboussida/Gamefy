package com.gamefy.gamefy_back.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PackCoachingAdminDto {
    private Integer id;
    private String name;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime hours;

    private String description;
    private String coachName;
    private Double price;
    private Integer coachId;
    private Integer durationMonths;
}
