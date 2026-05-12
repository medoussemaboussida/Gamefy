package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CoachProfileDto;
import com.gamefy.gamefy_back.dto.UpdateCoachProfileDto;
import com.gamefy.gamefy_back.model.CoachProfile;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.repository.CoachProfileRepository;
import com.gamefy.gamefy_back.repository.ReservationRepository;
import com.gamefy.gamefy_back.repository.UserPackCoachingRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository coachProfileRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final UserPackCoachingRepository userPackCoachingRepository;

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
        profile.setBio(dto.getBio());

        CoachProfile savedProfile = coachProfileRepository.save(profile);
        return mapToDto(savedProfile);
    }

    @Transactional
    public void deleteProfile(Integer userId) {
        CoachProfile profile = coachProfileRepository.findByCoachId(userId)
                .orElseThrow(() -> new RuntimeException("Coach profile not found"));
        coachProfileRepository.delete(profile);
    }

    /**
     * Get dashboard stats for the logged-in coach:
     * - totalSessions: total reservations assigned to this coach
     * - activeBookedPacks: number of UserPackCoaching with ACTIVE status for this coach's packs
     */
    public Map<String, Object> getCoachStats(Integer coachId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalSessions = reservationRepository.findByCoachIdOrderByStartTimeDesc(coachId).size();
        long activeBookedPacks = userPackCoachingRepository.countByPackCoachingCoachIdAndStatus(coachId, UserPackStatus.ACTIVE);

        stats.put("totalSessions", totalSessions);
        stats.put("activeBookedPacks", activeBookedPacks);
        return stats;
    }

    private CoachProfileDto mapToDto(CoachProfile profile) {
        return CoachProfileDto.builder()
                .id(profile.getId())
                .coachId(profile.getCoach().getId())
                .firstName(profile.getCoach().getFirstName())
                .lastName(profile.getCoach().getLastName())
                .game(profile.getGame())
                .hourlyPrice(profile.getHourlyPrice())
                .bio(profile.getBio())
                .build();
    }
}
