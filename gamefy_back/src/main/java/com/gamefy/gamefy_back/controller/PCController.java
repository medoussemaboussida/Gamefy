package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.PCService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/pcs")
public class PCController {

    private PCService service;

}
