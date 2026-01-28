package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.WorkDaysSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkDaysScheduleRepository extends JpaRepository<WorkDaysSchedule, Integer> {
}
