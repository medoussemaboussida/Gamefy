package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CoachProfileDto;
import com.gamefy.gamefy_back.dto.UpdateCoachProfileDto;
import com.gamefy.gamefy_back.model.CoachProfile;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.CoachProfileRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository coachProfileRepository;
    private final UserRepository userRepository;

    public CoachProfileDto getProfileByUserId(Integer userId) {
        CoachProfile profile = coachProfileRepository.findByCoachId(userId)
                .orElseThrow(() -> new RuntimeException("Coach profile not found for user ID: " + userId));
        return mapToDto(profile);
    }

    @Transactional
    public CoachProfileDto saveProfile(Integer userId, UpdateCoachProfileDto dto) {
        User coach = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CoachProfile profile = coachProfileRepository.findByCoachId(userId)
                .orElse(new CoachProfile());

        profile.setCoach(coach);
        profile.setGame(dto.getGame());
        profile.setHourlyPrice(dto.getHourlyPrice());

        CoachProfile savedProfile = coachProfileRepository.save(profile);
        return mapToDto(savedProfile);
    }

    @Transactional
    public void deleteProfile(Integer userId) {
        CoachProfile profile = coachProfileRepository.findByCoachId(userId)
                .orElseThrow(() -> new RuntimeException("Coach profile not found"));
        coachProfileRepository.delete(profile);
    }

    private CoachProfileDto mapToDto(CoachProfile profile) {
        return CoachProfileDto.builder()
                .id(profile.getId())
                .coachId(profile.getCoach().getId())
                .firstName(profile.getCoach().getFirstName())
                .lastName(profile.getCoach().getLastName())
                .game(profile.getGame())
                .hourlyPrice(profile.getHourlyPrice())
                .build();
    }
}
