package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.CoachingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/coaching-sessions")
@RequiredArgsConstructor
public class CoachingSessionController {

    private final CoachingSessionService service;

}
