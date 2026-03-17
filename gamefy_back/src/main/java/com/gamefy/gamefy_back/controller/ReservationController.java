package com.gamefy.gamefy_back.controller;

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
            @RequestBody ReservationDto dto,
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
}
