package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.UserPackGamefy;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPackGamefyRepository extends JpaRepository<UserPackGamefy, Integer> {

    List<UserPackGamefy> findByUserAndStatus(User user, UserPackStatus status);

    List<UserPackGamefy> findByUser(User user);

    Optional<UserPackGamefy> findByUserAndPackGamefyAndStatus(User user, PackGamefy packGamefy, UserPackStatus status);

    void deleteByUserAndPackGamefy(User user, PackGamefy packGamefy);

    List<UserPackGamefy> findByPackGamefy(PackGamefy packGamefy);

    Optional<UserPackGamefy> findFirstByUserOrderByActivatedAtDesc(User user);
}
