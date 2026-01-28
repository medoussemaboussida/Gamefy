package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.PackCoachingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/pack-coachings")
@RequiredArgsConstructor
public class PackCoachingController {

    private final PackCoachingService service;

}
