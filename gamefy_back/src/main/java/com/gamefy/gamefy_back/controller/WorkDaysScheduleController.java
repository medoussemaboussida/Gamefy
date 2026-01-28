package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.WorkDaysScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/work-days-schedules")
@RequiredArgsConstructor
public class WorkDaysScheduleController {

    private final WorkDaysScheduleService service;

}
