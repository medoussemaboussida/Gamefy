package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.CoachingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoachingSlotRepository extends JpaRepository<CoachingSlot, Integer> {
}
