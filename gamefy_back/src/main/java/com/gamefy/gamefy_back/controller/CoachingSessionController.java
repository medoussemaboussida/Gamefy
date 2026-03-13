package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.CoachingSessionDto;
import com.gamefy.gamefy_back.service.CoachingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/coaching-sessions")
@RequiredArgsConstructor
public class CoachingSessionController {

    private final CoachingSessionService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<List<CoachingSessionDto>> getAllSchedules() {
        return ResponseEntity.ok(service.getAllSchedules());
    }

    @GetMapping("/coach/{coachId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH', 'PLAYER')")
    public ResponseEntity<List<CoachingSessionDto>> getSchedulesByCoach(@PathVariable Integer coachId) {
        return ResponseEntity.ok(service.getSchedulesByCoach(coachId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH', 'PLAYER')")
    public ResponseEntity<CoachingSessionDto> getScheduleById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getScheduleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<CoachingSessionDto> createSchedule(@RequestBody CoachingSessionDto dto) {
        return ResponseEntity.ok(service.createSchedule(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<CoachingSessionDto> updateSchedule(@PathVariable Integer id, @RequestBody CoachingSessionDto dto) {
        return ResponseEntity.ok(service.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Integer id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
