package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Participant;
import com.gamefy.gamefy_back.model.ParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, ParticipantId> {
}
