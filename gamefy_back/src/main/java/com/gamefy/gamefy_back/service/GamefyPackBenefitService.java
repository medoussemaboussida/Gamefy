package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.GamefyPackBenefitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GamefyPackBenefitService {

    private final GamefyPackBenefitRepository repository;

}
