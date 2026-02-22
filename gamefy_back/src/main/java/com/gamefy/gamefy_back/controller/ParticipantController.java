package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.ParticipantDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Participant_Status;
import com.gamefy.gamefy_back.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gamefy/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('COACH', 'PLAYER')")
    public ResponseEntity<java.util.List<ParticipantDto>> getMyParticipations(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(participantService.getMyParticipations(currentUser));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<java.util.List<ParticipantDto>> getEventParticipants(
            @PathVariable Integer eventId) {
        return ResponseEntity.ok(participantService.getParticipantsByEventId(eventId));
    }

    @PutMapping("/{participantId}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<ParticipantDto> updateParticipantStatus(
            @PathVariable Integer participantId,
            @RequestParam Participant_Status status) {
        return ResponseEntity.ok(participantService.updateParticipantStatus(participantId, status));
    }

    @PostMapping("/participate/{eventId}")
    @PreAuthorize("hasAnyAuthority('COACH', 'PLAYER')")
    public ResponseEntity<ParticipantDto> participate(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(participantService.participate(eventId, currentUser));
    }

    @DeleteMapping("/cancel/{eventId}")
    @PreAuthorize("hasAnyAuthority('COACH', 'PLAYER')")
    public ResponseEntity<ParticipantDto> cancelParticipation(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(participantService.cancelParticipation(eventId, currentUser));
    }
}
