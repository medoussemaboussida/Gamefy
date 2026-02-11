package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreateUserDto;
import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    private static final SecureRandom random = new SecureRandom();

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User createUser(CreateUserDto request) {
        // Only ADMIN or WEB_MASTER can be created via this method
        if (request.getRole() != Roles.ADMIN && request.getRole() != Roles.WEB_MASTER) {
            throw new RuntimeException("Only ADMIN or WEB_MASTER roles can be assigned");
        }

        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Generate a random 10-character password
        String randomPassword = generateRandomPassword(10);

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(randomPassword));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = repository.save(user);

        // Send notification email with the generated password and role
        emailService.sendAdminCreationEmail(user.getEmail(), randomPassword, user.getRole().name());

        return savedUser;
    }

    public void deleteUser(Integer id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Notify user before deletion
        emailService.sendAccountDeletedEmail(user.getEmail());
        
        // Delete user
        repository.delete(user);
    }

    public User updateUserStatus(Long userId, Boolean enabled) {
        User user = repository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Update status based on enabled parameter
        user.setStatus(enabled ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        User updatedUser = repository.save(user);
        
        // Send appropriate email notification
        if (enabled) {
            emailService.sendAccountActivatedEmail(user.getEmail());
        } else {
            emailService.sendAccountDisabledEmail(user.getEmail());
        }
        
        return updatedUser;
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
