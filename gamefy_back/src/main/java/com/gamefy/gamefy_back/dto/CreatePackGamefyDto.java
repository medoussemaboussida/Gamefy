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
    private List<BenefitRequest> benefits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenefitRequest {
        private String benefitType;
        private String rateRule;
    }
}
