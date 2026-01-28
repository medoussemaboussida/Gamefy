package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.GamefyPackBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GamefyPackBenefitRepository extends JpaRepository<GamefyPackBenefit, Integer> {
}
