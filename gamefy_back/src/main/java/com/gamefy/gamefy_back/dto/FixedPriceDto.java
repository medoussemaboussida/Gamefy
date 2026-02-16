package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.PC_Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedPriceDto {
    private Integer id;
    private Float oneHourPrice;
    private Float twoHoursPrice;
    private Float threeHoursPrice;
    private PC_Type pcType;
}
