package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByPlayerIdOrderByStartTimeDesc(Integer playerId);
    List<Reservation> findByCoachIdOrderByStartTimeDesc(Integer coachId);
}
