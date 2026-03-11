package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByUserAndPackGamefy(User user, PackGamefy packGamefy);
}
