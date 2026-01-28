package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/auth")
public class AuthController {

    private AuthService service;

}
