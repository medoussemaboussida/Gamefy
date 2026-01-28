package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.PackGamefyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pack-gamefies")
public class PackGamefyController {

    private PackGamefyService service;

}
