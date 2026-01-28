package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.PackCoachingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PackCoachingService {

    private final PackCoachingRepository repository;

}
