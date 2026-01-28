package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PCRepository extends JpaRepository<PC, Integer> {
}
