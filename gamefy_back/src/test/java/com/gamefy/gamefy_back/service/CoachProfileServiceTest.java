package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CoachProfileDto;
import com.gamefy.gamefy_back.dto.UpdateCoachProfileDto;
import com.gamefy.gamefy_back.model.CoachProfile;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.repository.CoachProfileRepository;
import com.gamefy.gamefy_back.repository.ReservationRepository;
import com.gamefy.gamefy_back.repository.UserPackCoachingRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link CoachProfileService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CoachProfileService Unit Tests")
class CoachProfileServiceTest {

    @Mock private CoachProfileRepository coachProfileRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private UserPackCoachingRepository userPackCoachingRepository;

    @InjectMocks
    private CoachProfileService coachProfileService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User buildUser(Integer id, String firstName, String lastName) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(Roles.COACH);
        return user;
    }

    private CoachProfile buildProfile(Integer id, User coach, String game, Double price) {
        CoachProfile profile = new CoachProfile();
        profile.setId(id);
        profile.setCoach(coach);
        profile.setGame(game);
        profile.setHourlyPrice(price);
        profile.setBio("Bio for " + coach.getFirstName());
        return profile;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getProfileByUserId()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getProfileByUserId()")
    class GetProfileByUserId {

        @Test
        @DisplayName("✅ Found → returns DTO")
        void getProfileByUserId_found() {
            User coach = buildUser(1, "John", "Doe");
            CoachProfile profile = buildProfile(10, coach, "League of Legends", 25.0);
            given(coachProfileRepository.findByCoachId(1)).willReturn(Optional.of(profile));

            CoachProfileDto result = coachProfileService.getProfileByUserId(1);

            assertThat(result.getFirstName()).isEqualTo("John");
            assertThat(result.getGame()).isEqualTo("League of Legends");
            assertThat(result.getHourlyPrice()).isEqualTo(25.0);
        }

        @Test
        @DisplayName("❌ Not found → RuntimeException")
        void getProfileByUserId_notFound_throws() {
            given(coachProfileRepository.findByCoachId(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> coachProfileService.getProfileByUserId(99))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Coach profile not found");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  saveProfile()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("saveProfile()")
    class SaveProfile {

        @Test
        @DisplayName("✅ Update existing profile → saves and returns DTO")
        void saveProfile_updateExisting() {
            User coach = buildUser(1, "John", "Doe");
            CoachProfile existing = buildProfile(10, coach, "Old Game", 10.0);
            given(userRepository.findById(1)).willReturn(Optional.of(coach));
            given(coachProfileRepository.findByCoachId(1)).willReturn(Optional.of(existing));
            given(coachProfileRepository.save(any(CoachProfile.class))).willReturn(existing);

            UpdateCoachProfileDto dto = new UpdateCoachProfileDto("New Game", 30.0, "New Bio");
            CoachProfileDto result = coachProfileService.saveProfile(1, dto);

            assertThat(result.getGame()).isEqualTo("New Game");
            assertThat(result.getHourlyPrice()).isEqualTo(30.0);
            then(coachProfileRepository).should().save(existing);
        }

        @Test
        @DisplayName("✅ Create new profile if none exists → saves and returns DTO")
        void saveProfile_createNew() {
            User coach = buildUser(1, "Jane", "Doe");
            given(userRepository.findById(1)).willReturn(Optional.of(coach));
            given(coachProfileRepository.findByCoachId(1)).willReturn(Optional.empty());
            
            CoachProfile saved = buildProfile(11, coach, "Valorant", 20.0);
            given(coachProfileRepository.save(any(CoachProfile.class))).willReturn(saved);

            UpdateCoachProfileDto dto = new UpdateCoachProfileDto("Valorant", 20.0, "I am a coach");
            CoachProfileDto result = coachProfileService.saveProfile(1, dto);

            assertThat(result.getId()).isEqualTo(11);
            then(coachProfileRepository).should().save(any(CoachProfile.class));
        }

        @Test
        @DisplayName("❌ User not found → RuntimeException")
        void saveProfile_userNotFound_throws() {
            given(userRepository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> coachProfileService.saveProfile(99, new UpdateCoachProfileDto()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("User not found");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  deleteProfile()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteProfile()")
    class DeleteProfile {

        @Test
        @DisplayName("✅ Exists → deleted")
        void deleteProfile_success() {
            CoachProfile profile = new CoachProfile();
            given(coachProfileRepository.findByCoachId(1)).willReturn(Optional.of(profile));

            coachProfileService.deleteProfile(1);

            then(coachProfileRepository).should().delete(profile);
        }

        @Test
        @DisplayName("❌ Not found → RuntimeException")
        void deleteProfile_notFound_throws() {
            given(coachProfileRepository.findByCoachId(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> coachProfileService.deleteProfile(99))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getCoachStats()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getCoachStats()")
    class GetCoachStats {

        @Test
        @DisplayName("✅ Returns total sessions and active booked packs")
        void getCoachStats_returnsCorrectValues() {
            given(reservationRepository.findByCoachIdOrderByStartTimeDesc(1))
                    .willReturn(Collections.nCopies(5, any())); // 5 sessions
            given(userPackCoachingRepository.countByPackCoachingCoachIdAndStatus(1, UserPackStatus.ACTIVE))
                    .willReturn(3L); // 3 active packs

            Map<String, Object> result = coachProfileService.getCoachStats(1);

            assertThat(result).containsEntry("totalSessions", 5L);
            assertThat(result).containsEntry("activeBookedPacks", 3L);
        }
    }
}
