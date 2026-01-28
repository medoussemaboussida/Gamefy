package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackGamefy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackGamefyRepository extends JpaRepository<PackGamefy, Integer> {
}
