package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.DiscountType;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerPackGamefyDetailsDto {
    private String packName;
    private Double packPrice;
    private Integer durationMonths;
    private LocalDateTime activatedAt;
    private LocalDateTime expiresAt;
    private UserPackStatus status;

    private Double remainingPcHours;
    private Double totalPcHours;
    private Double remainingVipHours;
    private Double totalVipHours;
    private Double remainingCoachingHours;
    private Double totalCoachingHours;

    private List<DiscountBenefitDto> discountBenefits;
    private List<ItemBenefitDto> itemBenefits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountBenefitDto {
        private Integer benefitId;
        private Rate_Rule rateRule;
        private Benefit_type benefitType;
        private DiscountType discountType;
        private Double discountValue;
        private boolean isAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemBenefitDto {
        private Integer benefitId;
        private String itemName;
        private Integer totalQuantity;
        private Integer consumedQuantity;
        private Integer remainingQuantity;
    }
}
