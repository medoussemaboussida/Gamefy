package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.PaymentDtos;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.PaymentService;
import com.gamefy.gamefy_back.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;

    /**
     * Create a Stripe PaymentIntent for purchasing a pack
     */
    @PostMapping("/create-pack-intent")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<PaymentDtos.PaymentIntentResponse> createPackIntent(
            @RequestBody PaymentDtos.PackPaymentRequest request,
            @AuthenticationPrincipal User currentUser) throws StripeException {
        return ResponseEntity.ok(paymentService.createPackPaymentIntent(request.getPackId(), currentUser.getId()));
    }

    /**
     * Webhook endpoint for Stripe events
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = stripeService.verifyWebhook(payload, sigHeader);

            // Handle the event
            if ("payment_intent.succeeded".equals(event.getType())) {
                EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
                StripeObject stripeObject = dataObjectDeserializer.getObject().orElseThrow(
                        () -> new RuntimeException("Failed to deserialize Stripe object")
                );

                if (stripeObject instanceof PaymentIntent intent) {
                    String type = intent.getMetadata().get("type");
                    if ("PACK_PURCHASE".equals(type)) {
                        paymentService.handlePackPaymentSucceeded(intent);
                    }
                }
            }

            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Webhook Error: " + e.getMessage());
        }
    }

    /**
     * Called directly by the front-end after Stripe confirms payment on the client side.
     * This is the primary fulfillment path for local development where Stripe webhooks
     * cannot reach localhost.
     */
    @PostMapping("/confirm-pack-payment")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<String> confirmPackPayment(
            @RequestBody PaymentDtos.PackConfirmRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            paymentService.fulfillPackPurchase(request.getPackId(), currentUser.getId());
            return ResponseEntity.ok("Pack purchase fulfilled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Fulfillment error: " + e.getMessage());
        }
    }

    /**
     * Get all pack IDs that the current user has already purchased
     */
    @GetMapping("/my-purchased-packs")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<List<Integer>> getMyPurchasedPacks(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(paymentService.getPurchasedPackIds(currentUser.getId()));
    }

    /**
     * Get all payments for back-office
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<PaymentDtos.AllPaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
