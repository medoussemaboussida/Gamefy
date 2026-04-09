package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PcGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PcGameRepository extends JpaRepository<PcGame, Integer> {
    Optional<PcGame> findByGameName(String gameName);
}
