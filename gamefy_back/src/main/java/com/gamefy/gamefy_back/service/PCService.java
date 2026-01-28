package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.PCRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PCService {

    private final PCRepository repository;

}
