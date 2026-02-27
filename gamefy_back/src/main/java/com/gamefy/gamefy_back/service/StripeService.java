package com.gamefy.gamefy_back.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Create a Stripe PaymentIntent
     * @param amount in cents (e.g., 1000 for 10.00)
     * @param currency e.g., "usd" or "tnd" (Stripe doesn't support TND directly for all features, but "eur" or "usd" works for testing)
     * @param metadata additional information to pass to Stripe
     * @return PaymentIntent
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency, Map<String, String> metadata) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .putAllMetadata(metadata)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    /**
     * Verify and construct a Stripe event from the webhook payload
     * @param payload Request body
     * @param sigHeader Stripe-Signature header
     * @return Event object
     * @throws Exception if signature verification fails
     */
    public Event verifyWebhook(String payload, String sigHeader) throws Exception {
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }
}
