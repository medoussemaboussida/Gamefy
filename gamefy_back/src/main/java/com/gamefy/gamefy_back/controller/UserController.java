package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/gamefy/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }
}
