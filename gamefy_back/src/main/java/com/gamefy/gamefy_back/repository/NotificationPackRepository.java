package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.NotificationPack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationPackRepository extends JpaRepository<NotificationPack, Integer> {

    List<NotificationPack> findByUserIdOrderByCreatedAtDesc(Integer userId);

    long countByUserIdAndIsReadFalse(Integer userId);

    List<NotificationPack> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);
}
