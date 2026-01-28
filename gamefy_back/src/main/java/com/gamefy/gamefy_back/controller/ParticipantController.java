package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/participants")
public class ParticipantController {

    private ParticipantService service;

}
