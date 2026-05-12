package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.CoachProfileDto;
import com.gamefy.gamefy_back.dto.UpdateCoachProfileDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.CoachProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gamefy/coaches/profile")
@RequiredArgsConstructor
public class CoachProfileController {

    private final CoachProfileService coachProfileService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<CoachProfileDto> getProfile(@PathVariable Integer userId) {
        return ResponseEntity.ok(coachProfileService.getProfileByUserId(userId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<CoachProfileDto> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(coachProfileService.getProfileByUserId(currentUser.getId()));
    }

    @PostMapping("/me")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<CoachProfileDto> createProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateCoachProfileDto dto) {
        return ResponseEntity.ok(coachProfileService.saveProfile(currentUser.getId(), dto));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<CoachProfileDto> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateCoachProfileDto dto) {
        return ResponseEntity.ok(coachProfileService.saveProfile(currentUser.getId(), dto));
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> deleteProfile(@AuthenticationPrincipal User currentUser) {
        coachProfileService.deleteProfile(currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<java.util.Map<String, Object>> getMyStats(@AuthenticationPrincipal User currentUser) {
        java.util.Map<String, Object> stats = coachProfileService.getCoachStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    // Admin overrides
    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<CoachProfileDto> adminUpdateProfile(
            @PathVariable Integer userId,
            @RequestBody UpdateCoachProfileDto dto) {
        return ResponseEntity.ok(coachProfileService.saveProfile(userId, dto));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> adminDeleteProfile(@PathVariable Integer userId) {
        coachProfileService.deleteProfile(userId);
        return ResponseEntity.noContent().build();
    }
}
