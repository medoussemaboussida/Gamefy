package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.CoachProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/coach-profiles")
public class CoachProfileController {

    private CoachProfileService service;

}
