package com.gamefy.gamefy_back.repository;

import com.gamefy.gamefy_back.model.Event;
import com.gamefy.gamefy_back.model.enums.Event_Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByEventStatusIn(List<Event_Status> statuses);
}
