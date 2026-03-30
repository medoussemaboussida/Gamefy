package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByPlayerIdOrderByStartTimeDesc(Integer playerId);
    List<Reservation> findByCoachIdOrderByStartTimeDesc(Integer coachId);

    @Query("SELECT r FROM Reservation r " +
           "LEFT JOIN r.coach c " +
           "JOIN r.player p " +
           "WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY r.startTime DESC")
    List<Reservation> searchByCoachOrPlayerName(@Param("keyword") String keyword);
}
