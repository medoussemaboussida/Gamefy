package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.CoachingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoachingSlotService {

    private final CoachingSlotRepository repository;

}
