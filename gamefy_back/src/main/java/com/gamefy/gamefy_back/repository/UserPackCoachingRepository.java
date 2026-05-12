package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackCoaching;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.UserPackCoaching;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPackCoachingRepository extends JpaRepository<UserPackCoaching, Integer> {

    List<UserPackCoaching> findByUserAndStatus(User user, UserPackStatus status);

    List<UserPackCoaching> findByUser(User user);

    List<UserPackCoaching> findByPackCoaching(PackCoaching packCoaching);

    java.util.Optional<UserPackCoaching> findFirstByUserOrderByActivatedAtDesc(User user);

    long countByPackCoachingCoachIdAndStatus(Integer coachId, UserPackStatus status);
}
