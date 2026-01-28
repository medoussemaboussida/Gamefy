package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.PcAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PcAvailabilityService {

    private final PcAvailabilityRepository repository;

}
