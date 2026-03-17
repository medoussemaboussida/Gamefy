package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Integer> {
    Optional<Offer> findFirstByStatus(Offer_Status status);
}
