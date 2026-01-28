package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository repository;

}
