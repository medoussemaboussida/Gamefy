package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByUserAndPackGamefy(User user, PackGamefy packGamefy);

    @Query("SELECT p FROM Payment p JOIN p.user u " +
           "WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Payment> searchByUserName(@Param("keyword") String keyword);
}
