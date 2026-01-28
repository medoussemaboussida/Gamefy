package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.PcAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/pc-availabilities")
@RequiredArgsConstructor
public class PcAvailabilityController {

    private final PcAvailabilityService service;

}
