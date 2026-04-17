package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto implements Serializable {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private Roles role;
    private UserStatus status;
    private String profilePhoto;
    private Integer packGamefyId;
    private String packGamefyName;
    private String packGamefyStatus;
    private Integer packCoachingId;
    private String packCoachingName;
    private String packCoachingStatus;
    private boolean twoFaActivated;
    private LocalDateTime createdAt;
    private Double totalHours;
    private Double remainingPcHours;
    private Double remainingVipHours;
    private Double remainingCoachingHours;
    private Integer remainingPcDiscountAmount;
    private Integer remainingPcDiscountPercentage;
    private Integer remainingVipDiscountAmount;
    private Integer remainingVipDiscountPercentage;
    private Integer remainingCoachingDiscountAmount;
    private Integer remainingCoachingDiscountPercentage;
}
