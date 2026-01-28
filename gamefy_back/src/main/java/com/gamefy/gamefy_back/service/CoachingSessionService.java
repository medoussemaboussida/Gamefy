package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.CoachingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoachingSessionService {

    private final CoachingSessionRepository repository;

}
