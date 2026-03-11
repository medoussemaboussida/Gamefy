package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferDto {

    private Integer id;

    @NotBlank(message = "Offer name is required")
    private String offerName;

    @NotNull(message = "Reduction is required")
    @Min(value = 0, message = "Reduction cannot be negative")
    @Max(value = 100, message = "Reduction cannot exceed 100%")
    private Double reduction;

    private Offer_Status status;
}