package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAll();
    }
}
