package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.CreateReservationDto;
import com.gamefy.gamefy_back.dto.ReservationDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.model.enums.Reservation_Type;
import com.gamefy.gamefy_back.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamefy/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService service;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<ReservationDto> createReservation(
            @RequestBody CreateReservationDto dto,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.createReservation(dto, user.getId()));
    }

    @GetMapping("/available-pcs")
    public ResponseEntity<List<Map<String, Object>>> getAvailablePCs(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam String type,
            @RequestParam(required = false) String game) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);
        Reservation_Type reservationType = Reservation_Type.valueOf(type);
        return ResponseEntity.ok(service.getAvailablePCs(startTime, endTime, reservationType, game));
    }

    @GetMapping("/games")
    public ResponseEntity<List<String>> getAvailableGames() {
        return ResponseEntity.ok(service.getAvailableGames());
    }

    @GetMapping("/coaches")
    public ResponseEntity<List<Map<String, Object>>> getCoachesByGame(@RequestParam String game) {
        return ResponseEntity.ok(service.getCoachesByGame(game));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<ReservationDto>> getMyReservations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.getReservationsByPlayer(user.getId()));
    }

    @GetMapping("/my-coaching")
    @PreAuthorize("hasAnyAuthority('COACH')")
    public ResponseEntity<List<ReservationDto>> getMyCoachingReservations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.getReservationsByCoach(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        return ResponseEntity.ok(service.getAllReservations());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<ReservationDto>> searchReservations(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchReservations(keyword));
    }

    /**
     * Set cash payment type on a reservation (status stays PENDING).
     */
    @PutMapping("/{id}/confirm-cash")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<ReservationDto> confirmCashReservation(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.setCashPaymentType(id, user.getId()));
    }

    /**
     * Player activates his active Gamefy pack benefits on a pending reservation.
     * This modifies the reservation's end time and/or price according to matching pack benefits.
     */
    @PutMapping("/{id}/activate-gamefy-pack")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<ReservationDto> activateGamefyPack(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.activateGamefyPack(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> deleteReservation(@PathVariable Integer id) {
        service.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin/Webmaster: change a reservation's status.
     * CONFIRMED → payment record created immediately.
     * CANCELLED / PENDING → scheduler auto-deletes after 24 h (uses createdAt).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<ReservationDto> updateReservationStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
