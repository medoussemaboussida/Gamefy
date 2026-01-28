package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.CoachingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/coaching-slots")
public class CoachingSlotController {

    private CoachingSlotService service;

}
