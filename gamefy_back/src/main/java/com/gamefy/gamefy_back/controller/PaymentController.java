package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

}
