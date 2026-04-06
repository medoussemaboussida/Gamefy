package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePackGamefyDto {
    private String name;
    private Double price;
    private String description;
    private Integer durationMonths;
    private List<BenefitRequest> benefits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenefitRequest {
        private String benefitType;
        private String rateRule;
        private String discountType;  // "PERCENTAGE" or "FIXED_AMOUNT", only when rateRule=DISCOUNT
        private Double discountValue; // e.g. 20 (for 20%) or 5.0 (for 5 TND)
    }
}
