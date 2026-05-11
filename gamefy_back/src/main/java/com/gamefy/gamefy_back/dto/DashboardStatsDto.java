package com.gamefy.gamefy_back.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDto {
    private long totalReservations;
    private long activePacksCount;
    private Map<String, Long> pcCountByType;
    private OfferDto activeOffer;
}
