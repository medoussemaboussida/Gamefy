package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.CoachingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoachingSessionRepository extends JpaRepository<CoachingSession, Integer> {
}
