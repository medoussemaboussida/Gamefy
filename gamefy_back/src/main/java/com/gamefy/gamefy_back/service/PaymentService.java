package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PaymentDtos;
import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.Reservation;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.repository.PackGamefyRepository;
import com.gamefy.gamefy_back.repository.PaymentRepository;
import com.gamefy.gamefy_back.repository.ReservationRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PackGamefyRepository packGamefyRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final StripeService stripeService;

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
        reservationService.confirmReservationPayment(reservationId, Payment_Type.CARD_PAYMENT, userId);
    }

    /**
     * Fulfill a cash reservation payment.
     * Creates Payment record and confirms the reservation.
     */
    @Transactional
    public void fulfillReservationCashPayment(Integer reservationId, Integer userId) {
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
        reservationService.confirmReservationPayment(reservationId, Payment_Type.CASH_PAYMENT, userId);
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

        user.setPackGamefy(pack);
        userRepository.save(user);

        Payment payment = new Payment();
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        payment.setUser(user);
        paymentRepository.save(payment);
    }

    @Transactional
    public void fulfillPackPurchase(Integer packId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (user.getPackGamefy() != null && user.getPackGamefy().getId().equals(packId)) {
            throw new RuntimeException("You already hold this pack as your active pack");
        }

        PackGamefy pack = packGamefyRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found: " + packId));

        user.setPackGamefy(pack);
        userRepository.save(user);

        Payment payment = new Payment();
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        payment.setUser(user);
        paymentRepository.save(payment);
    }

    public List<Integer> getPurchasedPackIds(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        if (user.getPackGamefy() != null) {
            return List.of(user.getPackGamefy().getId());
        }
        return List.of();
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
}
