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
    private final PcGameRepository pcGameRepository;
    private final UserPackGamefyRepository userPackGamefyRepository;

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
                        .anyMatch(g -> g.getGameName().equalsIgnoreCase(dto.getGame()));
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

        // If reservation is fully covered by pack (0 DT), auto-confirm
        if (dto.getPriceTime() != null && dto.getPriceTime() <= 0) {
            reservation.setStatus(Reservation_Status.CONFIRMED);
            reservation.setPaymentType(Payment_Type.PACK_COVERED);
        }
        if (coach != null) {
            reservation.setCoach(coach);
        }

        Reservation saved = reservationRepository.save(reservation);

        // Transition: Confirmed (Auto-confirmation for free reservations)
        if (saved.getStatus() == Reservation_Status.CONFIRMED) {
            subscriptionService.addHoursForConfirmedReservation(saved);
        }

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

        // Deduct pack benefits if the player activated them
        if (dto.getPackHoursUsed() != null && dto.getPackHoursUsed() > 0) {
            deductPackHours(userId, dto.getReservationType(), dto.getPackHoursUsed());
        }
        if (dto.getPackDiscountUsed() != null && dto.getPackDiscountUsed()) {
            deductPackDiscount(userId, dto.getReservationType());
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
                    .filter(pc -> pc.getGames().stream().anyMatch(g -> g.getGameName().equalsIgnoreCase(game)))
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
            pcInfo.put("games", pc.getGames().stream().map(PcGame::getGameName).collect(Collectors.toList()));
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
        return pcGameRepository.findAll().stream()
                .map(PcGame::getGameName)
                .collect(Collectors.toList());
    }

    /**
     * Get the current user's active pack benefits relevant to a reservation room type.
     */
    public Map<String, Object> getPackBenefitsForReservation(Integer userId, String roomType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserPackGamefy> activePacks = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        UserPackGamefy activePack = activePacks.isEmpty() ? null : activePacks.get(0);

        Map<String, Object> result = new LinkedHashMap<>();

        if (activePack == null) {
            result.put("hasActivePack", false);
            return result;
        }

        result.put("hasActivePack", true);
        result.put("packName", activePack.getPackGamefy().getName());

        // Map room type to benefit type
        Benefit_type benefitType = mapRoomTypeToBenefitType(roomType);

        // Get remaining hours for this room type
        double remainingHours = switch (benefitType) {
            case PC -> activePack.getRemainingPcHours() != null ? activePack.getRemainingPcHours() : 0.0;
            case VIP -> activePack.getRemainingVipHours() != null ? activePack.getRemainingVipHours() : 0.0;
            case COACH -> activePack.getRemainingCoachingHours() != null ? activePack.getRemainingCoachingHours() : 0.0;
        };
        result.put("remainingHours", remainingHours);

        // Get remaining discounts for this room type
        int remainingDiscounts = switch (benefitType) {
            case PC -> activePack.getRemainingPcDiscounts() != null ? activePack.getRemainingPcDiscounts() : 0;
            case VIP -> activePack.getRemainingVipDiscounts() != null ? activePack.getRemainingVipDiscounts() : 0;
            case COACH -> activePack.getRemainingCoachingDiscounts() != null ? activePack.getRemainingCoachingDiscounts() : 0;
        };
        result.put("remainingDiscounts", remainingDiscounts);

        // Get discount details from the pack's benefits
        GamefyPackBenefit discountBenefit = activePack.getPackGamefy().getBenefits().stream()
                .filter(b -> b.getBenefitType() == benefitType && b.getRateRule() == Rate_Rule.DISCOUNT)
                .findFirst()
                .orElse(null);

        if (discountBenefit != null && remainingDiscounts > 0) {
            result.put("discountType", discountBenefit.getDiscountType() != null ? discountBenefit.getDiscountType().name() : null);
            result.put("discountValue", discountBenefit.getDiscountValue());
        } else {
            result.put("discountType", null);
            result.put("discountValue", null);
        }

        return result;
    }

    private Benefit_type mapRoomTypeToBenefitType(String roomType) {
        return switch (roomType) {
            case "PC_ROOM" -> Benefit_type.PC;
            case "VIP_ROOM" -> Benefit_type.VIP;
            case "COACHING_ROOM" -> Benefit_type.COACH;
            default -> throw new RuntimeException("Unsupported room type: " + roomType);
        };
    }

    private void deductPackHours(Integer userId, Reservation_Type reservationType, Double hoursUsed) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserPackGamefy> activePacks = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        if (activePacks.isEmpty()) return;
        UserPackGamefy pack = activePacks.get(0);

        switch (reservationType) {
            case PC_ROOM -> pack.setRemainingPcHours(Math.max(0, pack.getRemainingPcHours() - hoursUsed));
            case VIP_ROOM -> pack.setRemainingVipHours(Math.max(0, pack.getRemainingVipHours() - hoursUsed));
            case COACHING_ROOM -> pack.setRemainingCoachingHours(Math.max(0, pack.getRemainingCoachingHours() - hoursUsed));
        }
        userPackGamefyRepository.save(pack);
    }

    private void deductPackDiscount(Integer userId, Reservation_Type reservationType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserPackGamefy> activePacks = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        if (activePacks.isEmpty()) return;
        UserPackGamefy pack = activePacks.get(0);

        switch (reservationType) {
            case PC_ROOM -> pack.setRemainingPcDiscounts(Math.max(0, pack.getRemainingPcDiscounts() - 1));
            case VIP_ROOM -> pack.setRemainingVipDiscounts(Math.max(0, pack.getRemainingVipDiscounts() - 1));
            case COACHING_ROOM -> pack.setRemainingCoachingDiscounts(Math.max(0, pack.getRemainingCoachingDiscounts() - 1));
        }
        userPackGamefyRepository.save(pack);
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
