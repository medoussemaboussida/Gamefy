package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.PackCoachingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/pack-coachings")
@RequiredArgsConstructor
public class PackCoachingController {

    private final PackCoachingService service;

    @GetMapping("/my-packs")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<List<PackCoachingDto>> getMyPacks(@AuthenticationPrincipal User coach) {
        return ResponseEntity.ok(service.getPacksByCoachId(coach.getId()));
    }

    @GetMapping("/my-pack-details")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<PlayerPackCoachingDetailsDto> getMyCoachingPackDetails(@AuthenticationPrincipal User player) {
        return ResponseEntity.ok(service.getMyCoachingPackDetails(player));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<PackCoachingDto> getPackById(@PathVariable Integer id, @AuthenticationPrincipal User coach) {
        return ResponseEntity.ok(service.getPackById(id, coach));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<PackCoachingDto> createPack(@Valid @RequestBody PackCoachingDto dto, @AuthenticationPrincipal User coach) {
        return ResponseEntity.ok(service.createPack(dto, coach));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<PackCoachingDto> updatePack(@PathVariable Integer id, @Valid @RequestBody PackCoachingDto dto, @AuthenticationPrincipal User coach) {
        return ResponseEntity.ok(service.updatePack(id, dto, coach));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'PLAYER')")
    public ResponseEntity<List<PackCoachingAdminDto>> getAllPacks() {
        return ResponseEntity.ok(service.getAllPacks());
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePackAdmin(@PathVariable Integer id) {
        service.deletePackAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assign-to-player")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> assignCoachingPackToPlayer(@RequestBody AssignPackDto request) {
        service.assignPackToPlayer(request.getPackId(), request.getUserId());
        return ResponseEntity.ok("Coaching pack assigned successfully to player");
    }

    @PostMapping("/remove-from-player/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> removeCoachingPackFromPlayer(@PathVariable Integer userId) {
        service.removePackFromPlayer(userId);
        return ResponseEntity.ok("Coaching pack removed successfully from player");
    }

    @PostMapping("/renew-pack")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> renewCoachingPack(@RequestBody AssignPackDto request) {
        service.renewPackForUser(request.getPackId(), request.getUserId());
        return ResponseEntity.ok("Coaching pack renewed successfully for player");
    }

    @GetMapping("/{id}/players")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<UserPackResponseDto>> getPlayersByPackId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPlayersByPackId(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> deletePack(@PathVariable Integer id, @AuthenticationPrincipal User coach) {
        service.deletePack(id, coach);
        return ResponseEntity.noContent().build();
    }
}
