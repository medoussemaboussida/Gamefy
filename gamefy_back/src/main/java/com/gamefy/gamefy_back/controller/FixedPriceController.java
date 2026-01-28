package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.FixedPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/fixed-prices")
public class FixedPriceController {

    private FixedPriceService service;

}
