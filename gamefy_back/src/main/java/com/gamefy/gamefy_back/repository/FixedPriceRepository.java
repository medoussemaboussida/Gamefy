package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.FixedPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FixedPriceRepository extends JpaRepository<FixedPrice, Integer> {
}
