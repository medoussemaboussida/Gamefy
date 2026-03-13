package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.CoachingSession;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachingSessionRepository extends JpaRepository<CoachingSession, Integer> {
    Optional<CoachingSession> findByCoachAndDayAndMonthAndYear(User coach, DayOfWeek day, String month, String year);
    List<CoachingSession> findByCoach(User coach);
    List<CoachingSession> findByCoachId(Integer coachId);
}
