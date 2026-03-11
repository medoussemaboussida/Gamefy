package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.WorkDaysSchedule;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkDaysScheduleRepository extends JpaRepository<WorkDaysSchedule, Integer> {
    Optional<WorkDaysSchedule> findByDayAndMonthAndYear(DayOfWeek day, String month, String year);
    List<WorkDaysSchedule> findByMonthAndYear(String month, String year);
}
