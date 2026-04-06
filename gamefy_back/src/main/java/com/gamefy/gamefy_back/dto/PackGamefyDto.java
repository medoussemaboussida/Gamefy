package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackGamefyDto {
    private Integer id;
    private String name;
    private Double price;
    private String description;
    private Integer durationMonths;
    private List<PackBenefitDto> benefits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackBenefitDto {
        private Integer id;
        private String benefitType;
        private String rateRule;
        private String discountType;
        private Double discountValue;
    }
}
