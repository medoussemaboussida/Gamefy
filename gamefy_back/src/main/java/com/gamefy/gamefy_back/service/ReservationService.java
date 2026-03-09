package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.ReservationDto;
import com.gamefy.gamefy_back.model.*;
import com.gamefy.gamefy_back.model.enums.*;
import com.gamefy.gamefy_back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PCRepository pcRepository;
    private final PcAvailabilityRepository pcAvailabilityRepository;
    private final UserRepository userRepository;

    /**
     * Create a reservation with multiple PCs.
     * For each selected PC, a PcAvailability record is created to block that time slot.
     */
    public ReservationDto createReservation(ReservationDto dto, Integer userId) {
        User player = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getPcIds() == null || dto.getPcIds().isEmpty()) {
            throw new RuntimeException("You must select at least one PC");
        }

        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Map reservation type to PC type
        PC_Type requiredPcType = mapReservationTypeToPcType(dto.getReservationType());

        // Validate all selected PCs
        List<PC> selectedPCs = new ArrayList<>();
        Set<Integer> bookedPcIds = getBookedPcIds(dto.getStartTime(), dto.getEndTime());

        for (Integer pcId : dto.getPcIds()) {
            PC pc = pcRepository.findById(pcId)
                    .orElseThrow(() -> new RuntimeException("PC not found with id: " + pcId));

            if (pc.getStatus() != PC_Status.AVAILABLE) {
                throw new RuntimeException("PC #" + pc.getPcNumber() + " is not available (status: " + pc.getStatus() + ")");
            }

            if (pc.getPcType() != requiredPcType) {
                throw new RuntimeException("PC #" + pc.getPcNumber() + " is not of type " + requiredPcType);
            }

            if (bookedPcIds.contains(pcId)) {
                throw new RuntimeException("PC #" + pc.getPcNumber() + " is already reserved for this time slot");
            }

            selectedPCs.add(pc);
        }

        // Create the reservation
        Reservation reservation = new Reservation();
        reservation.setPlayer(player);
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setPaymentType(dto.getPaymentType() != null ? dto.getPaymentType() : Payment_Type.CASH_PAYMENT);
        reservation.setReservationType(dto.getReservationType());
        reservation.setStatus(Reservation_Status.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);

        // Create PcAvailability records for each selected PC
        for (PC pc : selectedPCs) {
            PcAvailability availability = new PcAvailability();
            availability.setPc(pc);
            availability.setReservation(saved);
            availability.setStartTime(dto.getStartTime());
            availability.setEndTime(dto.getEndTime());
            pcAvailabilityRepository.save(availability);
        }

        // Return the DTO with the generated ID
        return ReservationDto.builder()
                .id(saved.getId())
                .reservationType(saved.getReservationType())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .paymentType(saved.getPaymentType())
                .pcIds(dto.getPcIds())
                .build();
    }

    /**
     * Get all PCs of a given type with their availability status for a time range.
     * Returns a list of maps with PC info and whether they are available.
     */
    public List<Map<String, Object>> getAvailablePCs(
            java.time.LocalDateTime startTime,
            java.time.LocalDateTime endTime,
            Reservation_Type reservationType) {

        PC_Type requiredPcType = mapReservationTypeToPcType(reservationType);

        // Get all PCs of the required type that are AVAILABLE
        List<PC> allPCs = pcRepository.findAll().stream()
                .filter(pc -> pc.getPcType() == requiredPcType && pc.getStatus() == PC_Status.AVAILABLE)
                .collect(Collectors.toList());

        // Get booked PC IDs for the time range
        Set<Integer> bookedPcIds = getBookedPcIds(startTime, endTime);

        // Build response
        List<Map<String, Object>> result = new ArrayList<>();
        for (PC pc : allPCs) {
            Map<String, Object> pcInfo = new LinkedHashMap<>();
            pcInfo.put("id", pc.getId());
            pcInfo.put("pcNumber", pc.getPcNumber());
            pcInfo.put("pcType", pc.getPcType().name());
            pcInfo.put("games", pc.getGames().name());
            pcInfo.put("pcLocation", pc.getPcLocation() != null ? pc.getPcLocation().name() : null);
            pcInfo.put("available", !bookedPcIds.contains(pc.getId()));
            result.add(pcInfo);
        }

        return result;
    }

    private Set<Integer> getBookedPcIds(java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {
        return pcAvailabilityRepository
                .findByStartTimeLessThanAndEndTimeGreaterThan(endTime, startTime)
                .stream()
                .map(pa -> pa.getPc().getId())
                .collect(Collectors.toSet());
    }

    public List<ReservationDto> getReservationsByPlayer(Integer userId) {
        return reservationRepository.findByPlayerIdOrderByStartTimeDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .reservationType(reservation.getReservationType())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .paymentType(reservation.getPaymentType())
                .status(reservation.getStatus())
                .priceTime(reservation.getPriceTime())
                .playerName(reservation.getPlayer().getFirstName() + " " + reservation.getPlayer().getLastName())
                .pcNumbers(reservation.getPcAvailabilities().stream()
                        .map(pa -> pa.getPc().getPcNumber())
                        .collect(Collectors.toList()))
                .build();
    }

    private PC_Type mapReservationTypeToPcType(Reservation_Type reservationType) {
        return switch (reservationType) {
            case PC_ROOM -> PC_Type.GAMING;
            case VIP_ROOM -> PC_Type.VIP;
            default -> throw new RuntimeException("Unsupported reservation type: " + reservationType);
        };
    }
}
