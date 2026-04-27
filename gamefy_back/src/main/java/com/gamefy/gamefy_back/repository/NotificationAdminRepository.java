package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.NotificationAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationAdminRepository extends JpaRepository<NotificationAdmin, Integer> {

    List<NotificationAdmin> findAllByOrderByCreatedAtDesc();
}
