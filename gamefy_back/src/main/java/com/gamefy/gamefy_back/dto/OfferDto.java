package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
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
    private String offerName;
    private Double reduction;
    private Offer_Status status;
}