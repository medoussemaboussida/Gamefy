package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Integer> {
    List<Participant> findByEventId(Integer eventId);
    List<Participant> findByUserId(Integer userId);
    Optional<Participant> findByEventIdAndUserId(Integer eventId, Integer userId);
}
