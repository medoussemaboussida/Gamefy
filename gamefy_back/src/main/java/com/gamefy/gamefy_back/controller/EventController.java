package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/events")
public class EventController {

    private EventService service;

}
