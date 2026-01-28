package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.CoachProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository repository;

}
