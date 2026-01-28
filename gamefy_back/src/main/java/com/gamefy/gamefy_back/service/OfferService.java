package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository repository;

}
