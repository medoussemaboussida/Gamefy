package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreateUserDto;
import com.gamefy.gamefy_back.dto.UserResponseDto;
import com.gamefy.gamefy_back.dto.UpdateProfileDto;
import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.UserPackCoaching;
import com.gamefy.gamefy_back.model.UserPackGamefy;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import com.gamefy.gamefy_back.repository.SubscriptionRepository;
import com.gamefy.gamefy_back.repository.UserPackCoachingRepository;
import com.gamefy.gamefy_back.repository.UserPackGamefyRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    private final SubscriptionRepository subscriptionRepository;
    private final UserPackGamefyRepository userPackGamefyRepository;
    private final UserPackCoachingRepository userPackCoachingRepository;
    private final PackGamefyService packGamefyService;
    private final PackCoachingService packCoachingService;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    private static final SecureRandom random = new SecureRandom();

    @Cacheable(value = "users")
    public List<UserResponseDto> getAllUsers() {
        return repository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<UserResponseDto> searchUsers(String keyword) {
        return repository.searchByName(keyword).stream()
                .map(this::mapToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<UserResponseDto> getCoaches() {
        return repository.findByRole(Roles.COACH).stream()
                .map(this::mapToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @CacheEvict(value = "users", allEntries = true)
    public UserResponseDto createUser(CreateUserDto request) {
        // ... (body same as before but return mapToResponseDto)
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

        return mapToResponseDto(savedUser);
    }

    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(Integer id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Notify user before deletion
        emailService.sendAccountDeletedEmail(user.getEmail());
        
        // Delete user
        repository.delete(user);
    }

    @CacheEvict(value = "users", allEntries = true)
    public UserResponseDto updateUserStatus(Long userId, Boolean enabled) {
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
        
        return mapToResponseDto(updatedUser);
    }

    public UserResponseDto getUserById(Integer id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToResponseDto(user);
    }

    @CacheEvict(value = "users", allEntries = true)
    public UserResponseDto updateProfile(Integer userId, UpdateProfileDto request) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        return mapToResponseDto(repository.save(user));
    }

    private UserResponseDto mapToResponseDto(User user) {
        double totalHours = subscriptionRepository.findByPlayerId(user.getId())
                .map(s -> s.getTotalHours())
                .orElse(0.0);

        // Query junction tables for active packs
        List<UserPackGamefy> activeGamefyPacks = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        UserPackGamefy gamefyPack = activeGamefyPacks.isEmpty() ? null : activeGamefyPacks.get(0);

        // If no active pack, check for the latest pack (could be EXPIRED/CONSUMED)
        if (gamefyPack == null) {
            gamefyPack = userPackGamefyRepository.findFirstByUserOrderByActivatedAtDesc(user).orElse(null);
        }

        // Auto-check pack status (may transition ACTIVE -> EXPIRED/CONSUMED)
        if (gamefyPack != null) {
            gamefyPack = packGamefyService.checkAndUpdatePackStatus(gamefyPack);
        }

        // Query junction tables for active coaching packs
        List<UserPackCoaching> activeCoachingPacks = userPackCoachingRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        UserPackCoaching coachingPack = activeCoachingPacks.isEmpty() ? null : activeCoachingPacks.get(0);

        // If no active coaching pack, check for the latest (fallback to EXPIRED/CONSUMED)
        if (coachingPack == null) {
            coachingPack = userPackCoachingRepository.findFirstByUserOrderByActivatedAtDesc(user).orElse(null);
        }

        // Auto-check status
        if (coachingPack != null) {
            coachingPack = packCoachingService.checkAndUpdatePackStatus(coachingPack);
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .profilePhoto(user.getProfilePhoto())
                .packGamefyId(gamefyPack != null ? gamefyPack.getPackGamefy().getId() : null)
                .packGamefyName(gamefyPack != null ? gamefyPack.getPackGamefy().getName() : null)
                .packGamefyStatus(gamefyPack != null ? gamefyPack.getStatus().name() : null)
                .packCoachingId(coachingPack != null ? coachingPack.getPackCoaching().getId() : null)
                .packCoachingName(coachingPack != null ? coachingPack.getPackCoaching().getName() : null)
                .packCoachingStatus(coachingPack != null ? coachingPack.getStatus().name() : null)
                .twoFaActivated(user.isTwoFaActivated())
                .createdAt(user.getCreatedAt())
                .totalHours(totalHours)
                .remainingPcHours(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingPcHours() : 0.0)
                .remainingVipHours(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingVipHours() : 0.0)
                .remainingCoachingHours(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingCoachingHours() : 0.0)
                .remainingPcDiscounts(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingPcDiscounts() : 0)
                .remainingVipDiscounts(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingVipDiscounts() : 0)
                .remainingCoachingDiscounts(gamefyPack != null && gamefyPack.getStatus() == UserPackStatus.ACTIVE ? gamefyPack.getRemainingCoachingDiscounts() : 0)
                .build();
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
