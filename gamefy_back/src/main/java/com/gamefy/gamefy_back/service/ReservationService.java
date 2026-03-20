package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.ReservationDto;
import com.gamefy.gamefy_back.model.*;
import com.gamefy.gamefy_back.model.enums.*;
import com.gamefy.gamefy_back.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import com.gamefy.gamefy_back.model.Payment;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PCRepository pcRepository;
    private final PcAvailabilityRepository pcAvailabilityRepository;
    private final UserRepository userRepository;
    private final CoachingSlotRepository coachingSlotRepository;
    private final CoachingSessionRepository coachingSessionRepository;
    private final CoachProfileRepository coachProfileRepository;
    private final PaymentRepository paymentRepository;

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

            // If coaching, ensure PC has the requested game
            if (dto.getReservationType() == Reservation_Type.COACHING_ROOM && dto.getGame() != null) {
                if (!pc.getGames().name().equalsIgnoreCase(dto.getGame())) {
                    throw new RuntimeException("PC #" + pc.getPcNumber() + " does not have the game: " + dto.getGame());
                }
            }

            selectedPCs.add(pc);
        }

        // If coaching, validate coach
        final User coach;
        if (dto.getReservationType() == Reservation_Type.COACHING_ROOM) {
            if (dto.getCoachId() == null) {
                throw new RuntimeException("Coach ID is required for coaching reservation");
            }
            coach = userRepository.findById(dto.getCoachId())
                    .orElseThrow(() -> new RuntimeException("Coach not found"));
        } else {
            coach = null;
        }

        // Create the reservation
        Reservation reservation = new Reservation();
        reservation.setPlayer(player);
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setReservationType(dto.getReservationType());
        reservation.setStatus(Reservation_Status.PENDING);
        reservation.setPriceTime(dto.getPriceTime());
        if (coach != null) {
            reservation.setCoach(coach);
        }

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

        // If coaching, create CoachingSlot records
        if (dto.getReservationType() == Reservation_Type.COACHING_ROOM && coach != null) {
            // We need to find the coach's session that covers this time range to link the slot
            // For simplicity in this logic, we assume the frontend sends a time range that falls within a coach's session
            // The user wants it "added also to coaching_slot table, like we do in the pc_availibility"
            
            // First, find the coach's sessions for that day
            DayOfWeek dayOfWeek = DayOfWeek.valueOf(reservation.getStartTime().getDayOfWeek().name());
            String month = reservation.getStartTime().getMonth().name();
            String year = String.valueOf(reservation.getStartTime().getYear());
            
            List<CoachingSession> coachSessions = coachingSessionRepository.findByCoachId(coach.getId());
            CoachingSession session = coachSessions.stream()
                .filter(s -> s.getStatus() == CoachingSessionStatus.AVAILABLE)
                .filter(s -> s.getDay() == dayOfWeek && s.getMonth().trim().equalsIgnoreCase(month.trim()) && s.getYear().equals(year))
                .filter(s -> {
                    LocalTime reqStart = reservation.getStartTime().toLocalTime();
                    LocalTime reqEnd = reservation.getEndTime().toLocalTime();
                    LocalTime sStart = s.getStartTime();
                    LocalTime sEnd = s.getEndTime();
                    
                    // Handle session wrap-around (e.g. 23:00 - 01:00)
                    boolean isWrapAround = sStart.isAfter(sEnd);
                    
                    boolean startOk = isWrapAround 
                        ? (!reqStart.isBefore(sStart) || !reqStart.isAfter(sEnd))
                        : (!reqStart.isBefore(sStart) && !reqStart.isAfter(sEnd));
                        
                    boolean endOk = isWrapAround
                        ? (!reqEnd.isBefore(sStart) || !reqEnd.isAfter(sEnd))
                        : (!reqEnd.isBefore(sStart) && !reqEnd.isAfter(sEnd));
                        
                    return startOk && endOk;
                })
                .findFirst()
                .orElseThrow(() -> {
                    System.out.println("COACHING VALIDATION FAILED:");
                    System.out.println("Coach: " + coach.getFirstName() + " (ID: " + coach.getId() + ")");
                    System.out.println("Requested: Day=" + dayOfWeek + ", Month=" + month + ", Year=" + year);
                    System.out.println("Requested Range: " + reservation.getStartTime().toLocalTime() + " - " + reservation.getEndTime().toLocalTime());
                    return new RuntimeException("Coach is not available for this session time range");
                });

            CoachingSlot slot = new CoachingSlot();
            slot.setCoachingSession(session);
            slot.setReservation(saved);
            slot.setStartTime(reservation.getStartTime());
            slot.setEndTime(reservation.getEndTime());
            coachingSlotRepository.save(slot);
        }

        // Return the DTO with the generated ID
        return ReservationDto.builder()
                .id(saved.getId())
                .reservationType(saved.getReservationType())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .pcIds(dto.getPcIds())
                .coachId(dto.getCoachId())
                .game(dto.getGame())
                .priceTime(saved.getPriceTime())
                .build();
    }

    /**
     * Confirm a reservation after card payment succeeds.
     * Sets paymentType to CARD_PAYMENT and status to CONFIRMED.
     */
    public ReservationDto confirmCardPayment(Integer reservationId, Payment_Type paymentType, Integer userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getPlayer().getId().equals(userId)) {
            throw new RuntimeException("This reservation does not belong to you");
        }

        if (reservation.getStatus() != Reservation_Status.PENDING) {
            throw new RuntimeException("Only PENDING reservations can be confirmed");
        }

        reservation.setPaymentType(paymentType);
        reservation.setStatus(Reservation_Status.CONFIRMED);
        Reservation saved = reservationRepository.save(reservation);

        return mapToDto(saved);
    }

    /**
     * Set payment type to CASH_PAYMENT but keep status as PENDING.
     * The player will pay at the location; admin confirms later.
     */
    public ReservationDto setCashPaymentType(Integer reservationId, Integer userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getPlayer().getId().equals(userId)) {
            throw new RuntimeException("This reservation does not belong to you");
        }

        reservation.setPaymentType(Payment_Type.CASH_PAYMENT);
        // Status stays PENDING — admin will confirm after in-person payment
        Reservation saved = reservationRepository.save(reservation);

        return mapToDto(saved);
    }

    /**
     * Get all PCs of a given type with their availability status for a time range.
     * Returns a list of maps with PC info and whether they are available.
     */
    public List<Map<String, Object>> getAvailablePCs(
            java.time.LocalDateTime startTime,
            java.time.LocalDateTime endTime,
            Reservation_Type reservationType,
            String game) {

        PC_Type requiredPcType = mapReservationTypeToPcType(reservationType);

        // Get all PCs of the required type that are AVAILABLE
        List<PC> allPCs = pcRepository.findAll().stream()
                .filter(pc -> pc.getPcType() == requiredPcType && pc.getStatus() == PC_Status.AVAILABLE)
                .collect(Collectors.toList());

        // If game is provided (coaching flow), filter PCs by game
        if (reservationType == Reservation_Type.COACHING_ROOM && game != null) {
            allPCs = allPCs.stream()
                    .filter(pc -> pc.getGames().name().equalsIgnoreCase(game))
                    .collect(Collectors.toList());
        }

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

    public List<ReservationDto> getReservationsByCoach(Integer coachId) {
        return reservationRepository.findByCoachIdOrderByStartTimeDesc(coachId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Reservation::getStartTime).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));

        log.info("Admin deleting reservation ID={}", id);
        
        // Cleanup associated data
        if (reservation.getPcAvailabilities() != null && !reservation.getPcAvailabilities().isEmpty()) {
            pcAvailabilityRepository.deleteAll(reservation.getPcAvailabilities());
        }
        
        if (reservation.getCoachingSlots() != null && !reservation.getCoachingSlots().isEmpty()) {
            coachingSlotRepository.deleteAll(reservation.getCoachingSlots());
        }

        reservationRepository.delete(reservation);
    }

    /**
     * Admin/Webmaster: update reservation status.
     * - CONFIRMED  → creates a Payment record immediately.
     * - PENDING / CANCELLED → just updates the status; scheduler auto-deletes
     *   PENDING/CANCELLED reservations whose createdAt is older than 24 hours.
     */
    public ReservationDto updateStatus(Integer reservationId, String newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        Reservation_Status status;
        try {
            status = Reservation_Status.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        reservation.setStatus(status);
        Reservation saved = reservationRepository.save(reservation);

        if (status == Reservation_Status.CONFIRMED) {
            // Check if a payment record already exists for this reservation
            boolean alreadyPaid = !saved.getPayments().isEmpty();
            if (!alreadyPaid) {
                Payment payment = new Payment();
                payment.setReservation(saved);
                payment.setTotalPrice(saved.getPriceTime());
                payment.setUser(saved.getPlayer());
                paymentRepository.save(payment);
                log.info("Payment record created for confirmed reservation ID={}", reservationId);
            }
        }

        log.info("Admin updated reservation ID={} status to {}", reservationId, status);
        return mapToDto(saved);
    }

    private ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .reservationType(reservation.getReservationType())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .priceTime(reservation.getPriceTime())
                .paymentType(reservation.getPaymentType())
                .createdAt(reservation.getCreatedAt())
                .playerName(reservation.getPlayer().getFirstName() + " " + reservation.getPlayer().getLastName())
                .pcNumbers(reservation.getPcAvailabilities().stream()
                        .map(pa -> pa.getPc().getPcNumber())
                        .collect(Collectors.toList()))
                .coachId(reservation.getCoach() != null ? reservation.getCoach().getId() : null)
                .coachName(reservation.getCoach() != null ? 
                        reservation.getCoach().getFirstName() + " " + reservation.getCoach().getLastName() : null)
                .game(reservation.getCoach() != null && reservation.getCoach().getCoachProfile() != null ? 
                        reservation.getCoach().getCoachProfile().getGame() : null)
                .build();
    }

    private PC_Type mapReservationTypeToPcType(Reservation_Type reservationType) {
        return switch (reservationType) {
            case PC_ROOM -> PC_Type.GAMING;
            case VIP_ROOM -> PC_Type.VIP;
            case COACHING_ROOM -> PC_Type.GAMING; // Assuming coaching happens on gaming PCs, adjust if needed
            default -> throw new RuntimeException("Unsupported reservation type: " + reservationType);
        };
    }

    public List<String> getAvailableGames() {
        return Arrays.stream(PC_Games.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCoachesByGame(String game) {
        return coachProfileRepository.findByGameIgnoreCase(game).stream()
                .map(cp -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", cp.getCoach().getId());
                    map.put("name", cp.getCoach().getFirstName() + " " + cp.getCoach().getLastName());
                    map.put("hourlyPrice", cp.getHourlyPrice());
                    map.put("bio", cp.getBio());
                    map.put("game", cp.getGame());
                    return map;
                })
                .collect(Collectors.toList());
    }

    /**
     * Runs every 15 minutes.
     * Deletes PENDING (without CASH_PAYMENT) and CANCELLED reservations
     * whose createdAt is older than 24 hours.
     */
    @Scheduled(fixedRate = 900000)
    public void cleanupExpiredReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<Reservation> expired = reservationRepository.findAll().stream()
                .filter(r -> {
                    // PENDING without cash selection → auto-delete after 24h
                    boolean isPendingAutoDelete = r.getStatus() == Reservation_Status.PENDING
                            && r.getPaymentType() != Payment_Type.CASH_PAYMENT;
                    // CANCELLED by admin → auto-delete after 24h
                    boolean isCancelled = r.getStatus() == Reservation_Status.CANCELLED;
                    return isPendingAutoDelete || isCancelled;
                })
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isBefore(cutoff))
                .toList();

        for (Reservation reservation : expired) {
            log.info("Auto-deleting expired/cancelled reservation ID={} status={} (created at {})",
                    reservation.getId(), reservation.getStatus(), reservation.getCreatedAt());
            pcAvailabilityRepository.deleteAll(reservation.getPcAvailabilities());
            coachingSlotRepository.deleteAll(reservation.getCoachingSlots());
            reservationRepository.delete(reservation);
        }

        if (!expired.isEmpty()) {
            log.info("Cleaned up {} expired/cancelled reservation(s)", expired.size());
        }
    }
}
