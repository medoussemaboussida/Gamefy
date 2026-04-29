package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerPackCoachingDetailsDto {
    private String packName;
    private Double packPrice;
    private String coachName;
    private Integer durationMonths;
    private LocalDateTime activatedAt;
    private LocalDateTime expiresAt;
    private UserPackStatus status;

    private Double totalHours;
    private Double remainingHours;
    private Double consumedHours;
}
