package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PaymentDtos;
import com.gamefy.gamefy_back.model.*;
import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PackGamefyRepository packGamefyRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final StripeService stripeService;
    private final UserPackGamefyRepository userPackGamefyRepository;
    private final PackCoachingService packCoachingService;
    private final PackCoachingRepository packCoachingRepository;
    private final PackGamefyService packGamefyService;
    private final UserPackCoachingRepository userPackCoachingRepository;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    /**
     * Create a PaymentIntent for a specific pack
     */
    public PaymentDtos.PaymentIntentResponse createPackPaymentIntent(Integer packId, Integer userId) throws StripeException {
        PackGamefy pack = packGamefyRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        Long amount = (long) (pack.getPrice() * 100);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("packId", packId.toString());
        metadata.put("userId", userId.toString());
        metadata.put("type", "PACK_PURCHASE");

        PaymentIntent intent = stripeService.createPaymentIntent(amount, "usd", metadata);

        return new PaymentDtos.PaymentIntentResponse(
                intent.getClientSecret(),
                stripePublishableKey
        );
    }

    /**
     * Create a PaymentIntent for renewing a pack
     */
    public PaymentDtos.PaymentIntentResponse createRenewPackPaymentIntent(Integer packId, Integer userId) throws StripeException {
        PackGamefy pack = packGamefyRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        Long amount = (long) (pack.getPrice() * 100);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("packId", packId.toString());
        metadata.put("userId", userId.toString());
        metadata.put("type", "PACK_RENEWAL");

        PaymentIntent intent = stripeService.createPaymentIntent(amount, "usd", metadata);

        return new PaymentDtos.PaymentIntentResponse(
                intent.getClientSecret(),
                stripePublishableKey
        );
    }

    /**
     * Create a PaymentIntent for a specific coaching pack
     */
    public PaymentDtos.PaymentIntentResponse createCoachingPackPaymentIntent(Integer packId, Integer userId) throws StripeException {
        PackCoaching pack = packCoachingRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Coaching Pack not found"));

        Long amount = (long) (pack.getPrice() * 100);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("packId", packId.toString());
        metadata.put("userId", userId.toString());
        metadata.put("type", "COACHING_PACK_PURCHASE");

        PaymentIntent intent = stripeService.createPaymentIntent(amount, "usd", metadata);

        return new PaymentDtos.PaymentIntentResponse(
                intent.getClientSecret(),
                stripePublishableKey
        );
    }

    /**
     * Create a PaymentIntent for renewing a coaching pack
     */
    public PaymentDtos.PaymentIntentResponse createRenewCoachingPackPaymentIntent(Integer packId, Integer userId) throws StripeException {
        PackCoaching pack = packCoachingRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Coaching Pack not found"));

        Long amount = (long) (pack.getPrice() * 100);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("packId", packId.toString());
        metadata.put("userId", userId.toString());
        metadata.put("type", "COACHING_PACK_RENEWAL");

        PaymentIntent intent = stripeService.createPaymentIntent(amount, "usd", metadata);

        return new PaymentDtos.PaymentIntentResponse(
                intent.getClientSecret(),
                stripePublishableKey
        );
    }

    /**
     * Create a PaymentIntent for a reservation (card payment)
     */
    public PaymentDtos.PaymentIntentResponse createReservationPaymentIntent(Integer reservationId, Integer userId) throws StripeException {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getPlayer().getId().equals(userId)) {
            throw new RuntimeException("This reservation does not belong to you");
        }

        if (reservation.getPriceTime() == null || reservation.getPriceTime() <= 0) {
            throw new RuntimeException("Reservation has no price set");
        }

        Long amount = (long) (reservation.getPriceTime() * 100);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", reservationId.toString());
        metadata.put("userId", userId.toString());
        metadata.put("type", "RESERVATION_PAYMENT");

        PaymentIntent intent = stripeService.createPaymentIntent(amount, "usd", metadata);

        return new PaymentDtos.PaymentIntentResponse(
                intent.getClientSecret(),
                stripePublishableKey
        );
    }

    /**
     * Fulfill a reservation payment after Stripe confirms (card payment).
     * Creates Payment record and confirms the reservation.
     */
    @Transactional
    @CacheEvict(value = "reservations", allEntries = true)
    public void fulfillReservationPayment(Integer reservationId, Integer userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a payment record
        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setTotalPrice(reservation.getPriceTime());
        payment.setUser(user);
        paymentRepository.save(payment);

        // Confirm the reservation
        reservationService.confirmCardPayment(reservationId, Payment_Type.CARD_PAYMENT, userId);
    }

    /**
     * Fulfill the order after successful payment
     */
    @Transactional
    public void handlePackPaymentSucceeded(PaymentIntent intent) {
        String packIdStr = intent.getMetadata().get("packId");
        String userIdStr = intent.getMetadata().get("userId");

        if (packIdStr == null || userIdStr == null) {
            throw new RuntimeException("Missing metadata in PaymentIntent");
        }

        Integer packId = Integer.parseInt(packIdStr);
        Integer userId = Integer.parseInt(userIdStr);

        PackGamefy pack = packGamefyRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure only one active Gamefy pack at a time
        packGamefyService.removePackFromUser(userId);

        // Create junction record
        UserPackGamefy userPack = new UserPackGamefy();
        userPack.setUser(user);
        userPack.setPackGamefy(pack);
        userPack.setActivatedAt(LocalDateTime.now());
        userPack.setExpiresAt(LocalDateTime.now().plusMonths(pack.getDurationMonths()));
        userPack.setRemainingPcHours(calculateHours(pack, Benefit_type.PC));
        userPack.setRemainingVipHours(calculateHours(pack, Benefit_type.VIP));
        userPack.setRemainingCoachingHours(calculateHours(pack, Benefit_type.COACH));
        userPack.setAvailableDiscountIdsList(calculateAllDiscountIds(pack));
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        Payment payment = new Payment();
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        payment.setUser(user);
        paymentRepository.save(payment);
    }

    /**
     * Handle pack renewal payment via webhook
     */
    @Transactional
    public void handlePackRenewalSucceeded(PaymentIntent intent) {
        String packIdStr = intent.getMetadata().get("packId");
        String userIdStr = intent.getMetadata().get("userId");

        if (packIdStr == null || userIdStr == null) {
            throw new RuntimeException("Missing metadata in PaymentIntent");
        }

        Integer packId = Integer.parseInt(packIdStr);
        Integer userId = Integer.parseInt(userIdStr);
        packGamefyService.renewPackForUser(packId, userId);
    }

    /**
     * Handle coaching pack renewal payment via webhook
     */
    @Transactional
    public void handleCoachingPackRenewalSucceeded(PaymentIntent intent) {
        String packIdStr = intent.getMetadata().get("packId");
        String userIdStr = intent.getMetadata().get("userId");

        if (packIdStr == null || userIdStr == null) {
            throw new RuntimeException("Missing metadata in PaymentIntent");
        }

        Integer packId = Integer.parseInt(packIdStr);
        Integer userId = Integer.parseInt(userIdStr);
        packCoachingService.renewPackForUser(packId, userId);
    }

    /**
     * Fulfill the coaching pack order after successful payment
     */
    @Transactional
    public void handleCoachingPackPaymentSucceeded(PaymentIntent intent) {
        String packIdStr = intent.getMetadata().get("packId");
        String userIdStr = intent.getMetadata().get("userId");

        if (packIdStr == null || userIdStr == null) {
            throw new RuntimeException("Missing metadata in PaymentIntent");
        }

        Integer packId = Integer.parseInt(packIdStr);
        Integer userId = Integer.parseInt(userIdStr);

        packCoachingService.assignPackToPlayer(packId, userId);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void fulfillCoachingPackPurchase(Integer packId, Integer userId) {
        packCoachingService.assignPackToPlayer(packId, userId);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void fulfillPackPurchase(Integer packId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Check if user already has an active record for this pack
        PackGamefy pack = packGamefyRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found: " + packId));

        // Ensure only one active Gamefy pack at a time
        packGamefyService.removePackFromUser(userId);

        // Create junction record
        UserPackGamefy userPack = new UserPackGamefy();
        userPack.setUser(user);
        userPack.setPackGamefy(pack);
        userPack.setActivatedAt(LocalDateTime.now());
        userPack.setExpiresAt(LocalDateTime.now().plusMonths(pack.getDurationMonths()));
        userPack.setRemainingPcHours(calculateHours(pack, Benefit_type.PC));
        userPack.setRemainingVipHours(calculateHours(pack, Benefit_type.VIP));
        userPack.setRemainingCoachingHours(calculateHours(pack, Benefit_type.COACH));
        userPack.setAvailableDiscountIdsList(calculateAllDiscountIds(pack));
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        Payment payment = new Payment();
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        payment.setUser(user);
        paymentRepository.save(payment);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void fulfillPackRenewal(Integer packId, Integer userId) {
        packGamefyService.renewPackForUser(packId, userId);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void fulfillCoachingPackRenewal(Integer packId, Integer userId) {
        packCoachingService.renewPackForUser(packId, userId);
    }

    public PaymentDtos.MyPackStatusResponse getMyPackStatus(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // First check active
        List<UserPackGamefy> activeRecords = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        if (!activeRecords.isEmpty()) {
            UserPackGamefy pack = activeRecords.get(0);
            // Auto-check status
            pack = packGamefyService.checkAndUpdatePackStatus(pack);
            return PaymentDtos.MyPackStatusResponse.builder()
                    .packId(pack.getPackGamefy().getId())
                    .packName(pack.getPackGamefy().getName())
                    .status(pack.getStatus().name())
                    .build();
        }

        // Check for any pack (expired/consumed)
        return userPackGamefyRepository.findFirstByUserOrderByActivatedAtDesc(user)
                .map(pack -> PaymentDtos.MyPackStatusResponse.builder()
                        .packId(pack.getPackGamefy().getId())
                        .packName(pack.getPackGamefy().getName())
                        .status(pack.getStatus().name())
                        .build())
                .orElse(null);
    }

    /**
     * Get the current user's coaching pack status (ACTIVE/EXPIRED/CONSUMED or null)
     */
    public PaymentDtos.MyPackStatusResponse getMyCoachingPackStatus(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Use the repository method I just verified
        return userPackCoachingRepository.findFirstByUserOrderByActivatedAtDesc(user)
                .map(pack -> {
                    // Auto-check status (expiresAt, remainingHours)
                    pack = packCoachingService.checkAndUpdatePackStatus(pack);
                    return PaymentDtos.MyPackStatusResponse.builder()
                            .packId(pack.getPackCoaching().getId())
                            .packName(pack.getPackCoaching().getName())
                            .status(pack.getStatus().name())
                            .build();
                })
                .orElse(null);
    }

    public List<Integer> getPurchasedPackIds(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<UserPackGamefy> activeRecords = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        return activeRecords.stream()
                .map(r -> r.getPackGamefy().getId())
                .collect(Collectors.toList());
    }

    public List<Integer> getPurchasedCoachingPackIds(Integer userId) {
        return packCoachingService.getPurchasedCoachingPackIds(userId);
    }

    public List<PaymentDtos.AllPaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(payment -> {
                    String userName = "Unknown";
                    if (payment.getUser() != null) {
                        userName = payment.getUser().getFirstName() + " " + payment.getUser().getLastName();
                    }

                    String paidFor = "Other";
                    if (payment.getReservation() != null) {
                        paidFor = "Reservation";
                    } else if (payment.getPackGamefy() != null) {
                        paidFor = "Pack Gamefy: " + payment.getPackGamefy().getName();
                    } else if (payment.getPackCoaching() != null) {
                        paidFor = "Pack Coaching: " + payment.getPackCoaching().getName();
                    }

                    return PaymentDtos.AllPaymentResponse.builder()
                            .id(payment.getId())
                            .userName(userName)
                            .paidFor(paidFor)
                            .totalPrice(payment.getTotalPrice())
                            .build();
                })
                .toList();
    }

    public List<PaymentDtos.AllPaymentResponse> searchPayments(String keyword) {
        return paymentRepository.searchByUserName(keyword).stream()
                .map(payment -> {
                    String userName = "Unknown";
                    if (payment.getUser() != null) {
                        userName = payment.getUser().getFirstName() + " " + payment.getUser().getLastName();
                    }

                    String paidFor = "Other";
                    if (payment.getReservation() != null) {
                        paidFor = "Reservation";
                    } else if (payment.getPackGamefy() != null) {
                        paidFor = "Pack Gamefy: " + payment.getPackGamefy().getName();
                    } else if (payment.getPackCoaching() != null) {
                        paidFor = "Pack Coaching: " + payment.getPackCoaching().getName();
                    }

                    return PaymentDtos.AllPaymentResponse.builder()
                            .id(payment.getId())
                            .userName(userName)
                            .paidFor(paidFor)
                            .totalPrice(payment.getTotalPrice())
                            .build();
                })
                .toList();
    }

    /**
     * Count the number of benefits of a given type with rateRule=HOURS.
     * Each such benefit = 1 hour.
     */
    private double calculateHours(PackGamefy pack, Benefit_type type) {
        if (pack.getBenefits() == null) return 0.0;
        return pack.getBenefits().stream()
                .filter(b -> b.getBenefitType() == type && b.getRateRule() == Rate_Rule.HOURS)
                .count();
    }

    /**
     * Get all benefit IDs that are discounts.
     */
    private List<Integer> calculateAllDiscountIds(PackGamefy pack) {
        if (pack.getBenefits() == null) return new java.util.ArrayList<>();
        return pack.getBenefits().stream()
                .filter(b -> b.getRateRule() == Rate_Rule.DISCOUNT)
                .map(GamefyPackBenefit::getId)
                .collect(Collectors.toList());
    }
}
