package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/offers")
public class OfferController {

    private OfferService service;

}
