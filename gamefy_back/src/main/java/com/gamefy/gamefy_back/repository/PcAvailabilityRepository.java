package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PcAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PcAvailabilityRepository extends JpaRepository<PcAvailability, Integer> {
}
