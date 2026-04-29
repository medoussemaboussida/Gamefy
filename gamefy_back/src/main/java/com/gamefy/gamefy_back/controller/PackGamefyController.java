package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.*;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.PackGamefyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/pack-gamefies")
@RequiredArgsConstructor
@Slf4j
public class PackGamefyController {

    private final PackGamefyService service;

    @GetMapping
    public ResponseEntity<List<PackGamefyDto>> getAllPacks() {
        return ResponseEntity.ok(service.getAllPacks());
    }

    @GetMapping("/my-pack-details")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<PlayerPackGamefyDetailsDto> getMyPackDetails(@AuthenticationPrincipal User player) {
        return ResponseEntity.ok(service.getMyPackDetails(player));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackGamefyDto> getPackById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPackById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PackGamefyDto> createPack(@RequestBody CreatePackGamefyDto dto) {
        return ResponseEntity.ok(service.createPack(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PackGamefyDto> updatePack(@PathVariable Integer id, @RequestBody CreatePackGamefyDto dto) {
        return ResponseEntity.ok(service.updatePack(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePack(@PathVariable Integer id) {
        service.deletePack(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/players")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<UserPackResponseDto>> getPlayersByPackId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPlayersByPackId(id));
    }

    @PostMapping("/assign-to-player")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> assignPackToPlayer(@RequestBody AssignPackDto request) {
        log.info("Assigning pack {} to user {}", request.getPackId(), request.getUserId());
        service.assignPackToUser(request.getPackId(), request.getUserId());
        return ResponseEntity.ok("Pack assigned successfully to player");
    }

    @PostMapping("/remove-from-player/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> removePackFromPlayer(@PathVariable Integer userId) {
        log.info("Removing pack from user {}", userId);
        service.removePackFromUser(userId);
        return ResponseEntity.ok("Pack removed successfully from player");
    }

    @PostMapping("/renew-pack")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> renewPack(@RequestBody AssignPackDto request) {
        log.info("Renewing pack {} for user {}", request.getPackId(), request.getUserId());
        service.renewPackForUser(request.getPackId(), request.getUserId());
        return ResponseEntity.ok("Pack renewed successfully for player");
    }

    @PutMapping("/user-packs/{userPackId}/consume-item/{benefitId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> consumeItemBenefit(
            @PathVariable Integer userPackId,
            @PathVariable Integer benefitId) {
        log.info("Consuming item benefit {} for user pack {}", benefitId, userPackId);
        service.consumeItemBenefit(userPackId, benefitId);
        return ResponseEntity.ok("Item benefit marked as consumed");
    }

    @PutMapping("/user-packs/{userPackId}/unconsume-item/{benefitId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<String> unconsumeItemBenefit(
            @PathVariable Integer userPackId,
            @PathVariable Integer benefitId) {
        log.info("Un-consuming item benefit {} for user pack {}", benefitId, userPackId);
        service.unconsumeItemBenefit(userPackId, benefitId);
        return ResponseEntity.ok("Item benefit marked as not consumed");
    }
}
