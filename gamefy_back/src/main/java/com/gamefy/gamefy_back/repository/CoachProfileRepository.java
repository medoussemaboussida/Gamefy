package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.CoachProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoachProfileRepository extends JpaRepository<CoachProfile, Integer> {
    java.util.Optional<CoachProfile> findByCoachId(Integer coachId);
    List<CoachProfile> findByGameIgnoreCase(String game);
}
