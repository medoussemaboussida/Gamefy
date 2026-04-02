package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreateReservationDto;
import com.gamefy.gamefy_back.dto.ReservationDto;
import com.gamefy.gamefy_back.model.*;
import com.gamefy.gamefy_back.model.enums.*;
import com.gamefy.gamefy_back.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
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
    private final WorkDaysScheduleRepository workDaysScheduleRepository;
    private final SubscriptionService subscriptionService;

    /**
     * Create a reservation with multiple PCs.
     * For each selected PC, a PcAvailability record is created to block that time slot.
     */
    @CacheEvict(value = "reservations", allEntries = true)
    public ReservationDto createReservation(CreateReservationDto dto, Integer userId) {
        User player = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getPcIds() == null || dto.getPcIds().isEmpty()) {
            throw new RuntimeException("You must select at least one PC");
        }

        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        LocalDateTime normalizedEndTime = normalizeEndTime(dto.getStartTime(), dto.getEndTime());
        if (!normalizedEndTime.isAfter(dto.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Map reservation type to PC type
        PC_Type requiredPcType = mapReservationTypeToPcType(dto.getReservationType());

        // Validate all selected PCs
        List<PC> selectedPCs = new ArrayList<>();
        Set<Integer> bookedPcIds = getBookedPcIds(dto.getStartTime(), normalizedEndTime);

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
                boolean hasGame = pc.getGames().stream()
                        .anyMatch(g -> g.name().equalsIgnoreCase(dto.getGame()));
                if (!hasGame) {
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
        reservation.setEndTime(normalizedEndTime);
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
            availability.setEndTime(normalizedEndTime);
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
        return mapToDto(saved);
    }

    /**
     * Confirm a reservation after card payment succeeds.
     * Sets paymentType to CARD_PAYMENT and status to CONFIRMED.
     */
    @CacheEvict(value = "reservations", allEntries = true)
    public ReservationDto confirmCardPayment(Integer reservationId, Payment_Type paymentType, Integer userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getPlayer().getId().equals(userId)) {
            throw new RuntimeException("This reservation does not belong to you");
        }

        if (reservation.getStatus() != Reservation_Status.PENDING) {
            throw new RuntimeException("Only PENDING reservations can be confirmed");
        }

        Reservation_Status oldStatus = reservation.getStatus();
        reservation.setPaymentType(paymentType);
        reservation.setStatus(Reservation_Status.CONFIRMED);
        Reservation saved = reservationRepository.save(reservation);

        // Transition: Not Confirmed -> Confirmed
        if (oldStatus != Reservation_Status.CONFIRMED) {
            subscriptionService.addHoursForConfirmedReservation(saved);
        }

        return mapToDto(saved);
    }

    /**
     * Set payment type to CASH_PAYMENT but keep status as PENDING.
     * The player will pay at the location; admin confirms later.
     */
    @CacheEvict(value = "reservations", allEntries = true)
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
     * Applies the player's active Gamefy pack benefits to a pending reservation.
     * - HOURS: extends reservation endTime by +1 hour per matching benefit
     * - DISCOUNT: reduces reservation priceTime by (pack.price/2) per matching benefit
     *
     * Note: This does not confirm the reservation; payment confirmation still happens later.
     */
    @CacheEvict(value = "reservations", allEntries = true)
    public ReservationDto activateGamefyPack(Integer reservationId, Integer userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (!reservation.getPlayer().getId().equals(userId)) {
            throw new RuntimeException("This reservation does not belong to you");
        }

        if (Boolean.TRUE.equals(reservation.getGamefyPackActivated())) {
            throw new RuntimeException("Gamefy pack already activated for this reservation");
        }

        if (reservation.getStatus() != Reservation_Status.PENDING) {
            throw new RuntimeException("Only PENDING reservations can be activated with a pack");
        }

        // UI constraint: pack activation is only allowed before paymentType is set.
        if (reservation.getPaymentType() != null) {
            throw new RuntimeException("Pack activation is allowed only before choosing a payment method");
        }

        User player = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        PackGamefy pack = player.getPackGamefy();
        if (pack == null) {
            throw new RuntimeException("No active Gamefy pack found for this player");
        }

        Benefit_type wantedBenefitType = mapReservationTypeToBenefitType(reservation.getReservationType());
        if (wantedBenefitType == null) {
            throw new RuntimeException("Unsupported reservation type: " + reservation.getReservationType());
        }

        List<GamefyPackBenefit> matchingBenefits = (pack.getBenefits() == null ? List.<GamefyPackBenefit>of() : pack.getBenefits())
                .stream()
                .filter(b -> b.getBenefitType() == wantedBenefitType)
                .toList();

        int discountCount = (int) matchingBenefits.stream()
                .filter(b -> b.getRateRule() == Rate_Rule.DISCOUNT)
                .count();
        int hoursCount = (int) matchingBenefits.stream()
                .filter(b -> b.getRateRule() == Rate_Rule.HOURS)
                .count();

        if (discountCount == 0 && hoursCount == 0) {
            throw new RuntimeException("This pack has no matching benefits for the reservation type");
        }

        LocalDateTime newEndTime = reservation.getEndTime();

        // HOURS benefits: extend reservation end time up to the work-day closing boundary.
        if (hoursCount > 0) {
            LocalDateTime originalEndTime = reservation.getEndTime();
            int appliedHours = getApplicablePackHoursWithinSchedule(reservation, hoursCount);
            newEndTime = originalEndTime.plusHours(appliedHours);

            if (appliedHours > 0) {
                // Availability conflict check for all involved PCs
                if (reservation.getPcAvailabilities() != null && !reservation.getPcAvailabilities().isEmpty()) {
                    Set<Integer> currentPcIds = reservation.getPcAvailabilities().stream()
                            .map(pa -> pa.getPc().getId())
                            .collect(Collectors.toSet());

                    List<PcAvailability> overlaps = pcAvailabilityRepository
                            .findByStartTimeLessThanAndEndTimeGreaterThan(newEndTime, reservation.getStartTime());

                    boolean hasConflict = overlaps.stream()
                            .filter(pa -> pa.getPc() != null && currentPcIds.contains(pa.getPc().getId()))
                            .filter(pa -> pa.getReservation() != null && !pa.getReservation().getId().equals(reservationId))
                            .findAny()
                            .isPresent();

                    if (hasConflict) {
                        throw new RuntimeException("Cannot activate pack: selected PCs are already booked for the extended time");
                    }
                }

                // Update end times on linked slot records
                if (reservation.getPcAvailabilities() != null) {
                    for (PcAvailability pa : reservation.getPcAvailabilities()) {
                        pa.setEndTime(newEndTime);
                    }
                }

                if (reservation.getCoachingSlots() != null) {
                    for (CoachingSlot slot : reservation.getCoachingSlots()) {
                        slot.setEndTime(newEndTime);
                    }
                }

                reservation.setEndTime(newEndTime);

                if (reservation.getPcAvailabilities() != null && !reservation.getPcAvailabilities().isEmpty()) {
                    pcAvailabilityRepository.saveAll(reservation.getPcAvailabilities());
                }
                if (reservation.getCoachingSlots() != null && !reservation.getCoachingSlots().isEmpty()) {
                    coachingSlotRepository.saveAll(reservation.getCoachingSlots());
                }
            }
        }

        // DISCOUNT benefits: reduce priceTime
        if (discountCount > 0) {
            Double currentPrice = reservation.getPriceTime();
            if (currentPrice == null) currentPrice = 0.0;

            double reduction = (pack.getPrice() / 2.0) * discountCount;
            double updatedPrice = Math.max(0.0, currentPrice - reduction);
            reservation.setPriceTime(updatedPrice);
        }

        reservation.setGamefyPackActivated(true);
        Reservation saved = reservationRepository.save(reservation);
        return mapToDto(saved);
    }

    private Benefit_type mapReservationTypeToBenefitType(Reservation_Type reservationType) {
        return switch (reservationType) {
            case PC_ROOM -> Benefit_type.PC;
            case VIP_ROOM -> Benefit_type.VIP;
            case COACHING_ROOM -> Benefit_type.COACH;
            default -> null;
        };
    }

    private int getApplicablePackHoursWithinSchedule(Reservation reservation, int requestedHours) {
        if (requestedHours <= 0) return 0;

        LocalDateTime scheduleEndDateTime = getScheduleEndDateTimeForReservation(reservation);
        if (scheduleEndDateTime == null) return 0;

        long remainingMinutes = Duration.between(reservation.getEndTime(), scheduleEndDateTime).toMinutes();
        if (remainingMinutes <= 0) return 0;

        int maxWholeHoursBeforeClose = (int) (remainingMinutes / 60);
        return Math.min(requestedHours, Math.max(0, maxWholeHoursBeforeClose));
    }

    private LocalDateTime getScheduleEndDateTimeForReservation(Reservation reservation) {
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(reservation.getStartTime().getDayOfWeek().name());
        String month = reservation.getStartTime().getMonth().name();
        String year = String.valueOf(reservation.getStartTime().getYear());

        Optional<WorkDaysSchedule> scheduleOpt = workDaysScheduleRepository.findByDayAndMonthAndYear(dayOfWeek, month, year);
        if (scheduleOpt.isEmpty()) return null;

        WorkDaysSchedule schedule = scheduleOpt.get();
        if (schedule.getStatus() != WorkDayStatus.OPEN) return null;

        LocalDateTime reservationEnd = reservation.getEndTime();
        LocalDateTime sameDayEnd = LocalDateTime.of(reservationEnd.toLocalDate(), schedule.getEndTime());

        // Wrap-around day (e.g., 10:00 -> 05:00 next day): pick the correct closing datetime.
        if (schedule.getStartTime().isAfter(schedule.getEndTime())) {
            if (!reservationEnd.toLocalTime().isBefore(schedule.getStartTime())) {
                return sameDayEnd.plusDays(1);
            }
            return sameDayEnd;
        }

        return sameDayEnd;
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
                    .filter(pc -> pc.getGames().stream().anyMatch(g -> g.name().equalsIgnoreCase(game)))
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
            pcInfo.put("games", pc.getGames().stream().map(Enum::name).collect(Collectors.toList()));
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

    /**
     * Supports overnight reservations when frontend sends start/end on the same date
     * with an end hour that is earlier than the start hour (e.g. 23:00 -> 01:00).
     */
    private LocalDateTime normalizeEndTime(LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime.isAfter(startTime)) {
            return endTime;
        }

        if (endTime.toLocalDate().isEqual(startTime.toLocalDate()) && endTime.toLocalTime().isBefore(startTime.toLocalTime())) {
            return endTime.plusDays(1);
        }

        return endTime;
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

    @Cacheable(value = "reservations")
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Reservation::getStartTime).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReservationDto> searchReservations(String keyword) {
        return reservationRepository.searchByCoachOrPlayerName(keyword)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "reservations", allEntries = true)
    public void deleteReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));

        log.info("Admin deleting reservation ID={}", id);
        
        // If it was confirmed, remove the hours from subscription
        if (reservation.getStatus() == Reservation_Status.CONFIRMED) {
            subscriptionService.removeHoursForConfirmedReservation(reservation);
        }

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
    @CacheEvict(value = "reservations", allEntries = true)
    public ReservationDto updateStatus(Integer reservationId, String newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        Reservation_Status oldStatus = reservation.getStatus();
        Reservation_Status status;
        try {
            status = Reservation_Status.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        reservation.setStatus(status);
        Reservation saved = reservationRepository.save(reservation);

        // Transition: Not Confirmed -> Confirmed
        if (oldStatus != Reservation_Status.CONFIRMED && status == Reservation_Status.CONFIRMED) {
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
            // Update / create the player's subscription hours
            subscriptionService.addHoursForConfirmedReservation(saved);
        }
        // Transition: Confirmed -> Not Confirmed
        else if (oldStatus == Reservation_Status.CONFIRMED && status != Reservation_Status.CONFIRMED) {
            subscriptionService.removeHoursForConfirmedReservation(saved);
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
                .gamefyPackActivated(reservation.getGamefyPackActivated())
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
    @CacheEvict(value = "reservations", allEntries = true)
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
