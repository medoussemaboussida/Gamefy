package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository repository;

}
