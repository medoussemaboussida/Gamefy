package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gamefy/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

}
