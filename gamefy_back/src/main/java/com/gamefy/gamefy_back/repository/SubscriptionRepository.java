package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    Optional<Subscription> findByPlayerId(Integer playerId);
}
