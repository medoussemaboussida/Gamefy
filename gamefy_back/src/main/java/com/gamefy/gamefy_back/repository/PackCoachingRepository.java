package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackCoaching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackCoachingRepository extends JpaRepository<PackCoaching, Integer> {
}
