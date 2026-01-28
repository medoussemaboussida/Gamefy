package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.FixedPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FixedPriceService {

    private final FixedPriceRepository repository;

}
