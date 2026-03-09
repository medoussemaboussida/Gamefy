package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PcAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PcAvailabilityRepository extends JpaRepository<PcAvailability, Integer> {

    /**
     * Find all PC bookings that overlap with a given time range.
     * Overlap condition: existing.startTime < queriedEndTime AND existing.endTime > queriedStartTime
     */
    List<PcAvailability> findByStartTimeLessThanAndEndTimeGreaterThan(
            LocalDateTime endTime, LocalDateTime startTime);
}
