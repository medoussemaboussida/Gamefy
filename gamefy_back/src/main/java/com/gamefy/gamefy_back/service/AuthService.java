package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private UserRepository userRepository;

}
