package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.model.Reservation;
import com.gamefy.gamefy_back.model.Subscription;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    /**
     * Called whenever a reservation is confirmed (by admin or card payment).
     * Calculates the duration of the reservation in full hours (ignoring extra minutes)
     * and either creates a new Subscription for the player or increments totalHours
     * on their existing one.
     *
     * @param reservation the confirmed reservation
     */
    public void addHoursForConfirmedReservation(Reservation reservation) {
        User player = reservation.getPlayer();

        // Calculate duration in hours, allowing for decimals (e.g. 1h30m -> 1.5h)
        long minutes = Duration.between(reservation.getStartTime(), reservation.getEndTime()).toMinutes();
        double hours = minutes / 60.0;

        Subscription subscription = subscriptionRepository.findByPlayerId(player.getId())
                .orElse(null);

        if (subscription == null) {
            // First confirmed reservation for this player — create their subscription record
            subscription = new Subscription();
            subscription.setPlayer(player);
            subscription.setTotalHours(hours);
            subscriptionRepository.save(subscription);
            log.info("Created subscription for player ID={} with {} hour(s) (reservation ID={})",
                    player.getId(), hours, reservation.getId());
        } else {
            // Existing subscription — increment total hours
            subscription.setTotalHours(subscription.getTotalHours() + hours);
            subscriptionRepository.save(subscription);
            log.info("Updated subscription for player ID={}: +{} hour(s) → total {} hour(s) (reservation ID={})",
                    player.getId(), hours, subscription.getTotalHours(), reservation.getId());
        }
    }

    /**
     * Called whenever a reservation state changes from CONFIRMED to a non-confirmed state (PENDING, CANCELLED, REJECTED).
     *
     * @param reservation the reservation being downgraded
     */
    public void removeHoursForConfirmedReservation(Reservation reservation) {
        User player = reservation.getPlayer();
        long minutes = Duration.between(reservation.getStartTime(), reservation.getEndTime()).toMinutes();
        double hours = minutes / 60.0;

        Subscription subscription = subscriptionRepository.findByPlayerId(player.getId()).orElse(null);

        if (subscription != null) {
            subscription.setTotalHours(Math.max(0.0, subscription.getTotalHours() - hours));
            subscriptionRepository.save(subscription);
            log.info("Decremented subscription for player ID={}: -{} hour(s) → total {} hour(s) (reservation ID={})",
                    player.getId(), hours, subscription.getTotalHours(), reservation.getId());
        }
    }
}
