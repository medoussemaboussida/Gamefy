package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPackResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private UserPackStatus status;
    private Integer userId;
    private Integer userPackId;
    private List<ItemBenefitStatus> itemBenefits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemBenefitStatus {
        private Integer benefitId;
        private String itemName;
        private Integer itemQuantity;
        private int consumedQuantity;
    }
}
