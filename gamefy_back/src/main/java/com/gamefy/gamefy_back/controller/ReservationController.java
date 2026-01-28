package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService service;

}
