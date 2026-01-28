package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository repository;

}
