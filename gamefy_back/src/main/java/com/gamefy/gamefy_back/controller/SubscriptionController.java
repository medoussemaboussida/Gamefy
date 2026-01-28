package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/subscriptions")
public class SubscriptionController {

    private SubscriptionService service;

}
