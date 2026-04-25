package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.NotificationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationEventRepository extends JpaRepository<NotificationEvent, Integer> {

    List<NotificationEvent> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<NotificationEvent> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);

    long countByUserIdAndIsReadFalse(Integer userId);
}
