package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.model.Reservation;
import com.gamefy.gamefy_back.model.Subscription;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.repository.SubscriptionRepository;
import com.gamefy.gamefy_back.repository.UserPackGamefyRepository;
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
    private final UserPackGamefyRepository userPackGamefyRepository;

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

        // --- NEW: Decrement remaining PC hours from active PackGamefy ---
        userPackGamefyRepository.findByUserAndStatus(player, UserPackStatus.ACTIVE)
                .stream()
                .findFirst()
                .ifPresent(userPack -> {
                    if (userPack.getRemainingPcHours() != null && userPack.getRemainingPcHours() > 0) {
                        double remaining = Math.max(0.0, userPack.getRemainingPcHours() - hours);
                        userPack.setRemainingPcHours(remaining);
                        userPackGamefyRepository.save(userPack);
                        log.info("Decremented remainingPcHours for player ID={} (Active Pack: {}): -{} hour(s) → left {} hour(s)",
                                player.getId(), userPack.getPackGamefy().getName(), hours, remaining);
                    }
                });
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

        // --- NEW: Restore remaining PC hours to active PackGamefy ---
        userPackGamefyRepository.findByUserAndStatus(player, UserPackStatus.ACTIVE)
                .stream()
                .findFirst()
                .ifPresent(userPack -> {
                    // Logic to restore hours if it was a pack-based reservation
                    // We assume for now that if they have an active pack, we restore it
                    if (userPack.getRemainingPcHours() != null) {
                        double restored = userPack.getRemainingPcHours() + hours;
                        userPack.setRemainingPcHours(restored);
                        userPackGamefyRepository.save(userPack);
                        log.info("Restored remainingPcHours for player ID={} (Active Pack: {}): +{} hour(s) → total {} hour(s)",
                                player.getId(), userPack.getPackGamefy().getName(), hours, restored);
                    }
                });
    }
}
