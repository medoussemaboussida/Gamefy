package com.gamefy.gamefy_back.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackCoachingDto {

    private Integer id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Hours are required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime hours;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    private Integer coachId;
}
