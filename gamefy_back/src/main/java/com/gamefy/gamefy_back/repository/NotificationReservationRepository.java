package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.NotificationReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationReservationRepository extends JpaRepository<NotificationReservation, Integer> {

    List<NotificationReservation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<NotificationReservation> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);

    long countByUserIdAndIsReadFalse(Integer userId);
}
