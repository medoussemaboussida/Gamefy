package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.DashboardStatsDto;
import com.gamefy.gamefy_back.dto.OfferDto;
import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.repository.OfferRepository;
import com.gamefy.gamefy_back.repository.PCRepository;
import com.gamefy.gamefy_back.repository.ReservationRepository;
import com.gamefy.gamefy_back.repository.UserPackGamefyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReservationRepository reservationRepository;
    private final UserPackGamefyRepository userPackGamefyRepository;
    private final PCRepository pcRepository;
    private final OfferRepository offerRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalReservations = reservationRepository.count();
        long activePacksCount = userPackGamefyRepository.countByStatus(UserPackStatus.ACTIVE);

        Map<String, Long> pcCountByType = pcRepository.findAll().stream()
                .collect(Collectors.groupingBy(pc -> pc.getPcType().name(), Collectors.counting()));

        OfferDto activeOfferDto = offerRepository.findFirstByStatus(Offer_Status.ACTIVE)
                .map(this::mapOfferToDto)
                .orElse(null);

        return DashboardStatsDto.builder()
                .totalReservations(totalReservations)
                .activePacksCount(activePacksCount)
                .pcCountByType(pcCountByType)
                .activeOffer(activeOfferDto)
                .build();
    }

    private OfferDto mapOfferToDto(Offer offer) {
        return OfferDto.builder()
                .id(offer.getId())
                .offerName(offer.getOfferName())
                .reduction(offer.getReduction())
                .status(offer.getStatus())
                .build();
    }
}
