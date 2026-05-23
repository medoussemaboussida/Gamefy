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

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<ReservationDto> updateReservation(
            @PathVariable Integer id,
            @RequestBody CreateReservationDto dto,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.updateReservation(id, dto, user.getId()));
    }

    @GetMapping("/available-pcs")
    public ResponseEntity<List<Map<String, Object>>> getAvailablePCs(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam String type,
            @RequestParam(required = false) String game,
            @RequestParam(required = false) Integer excludeReservationId) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);
        Reservation_Type reservationType = Reservation_Type.valueOf(type);
        return ResponseEntity.ok(service.getAvailablePCs(startTime, endTime, reservationType, game, excludeReservationId));
    }

    @GetMapping("/games")
    public ResponseEntity<List<String>> getAvailableGames() {
        return ResponseEntity.ok(service.getAvailableGames());
    }

    @GetMapping("/coaches")
    public ResponseEntity<List<Map<String, Object>>> getCoachesByGame(@RequestParam String game) {
        return ResponseEntity.ok(service.getCoachesByGame(game));
    }

    @GetMapping("/my-pack-benefits")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Map<String, Object>> getMyPackBenefits(
            @RequestParam String roomType,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.getPackBenefitsForReservation(user.getId(), roomType));
    }

    @GetMapping("/my-coaching-pack-benefits")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Map<String, Object>> getMyCoachingPackBenefits(
            @RequestParam Integer coachId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(service.getCoachingPackBenefits(user.getId(), coachId));
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


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteReservation(@PathVariable Integer id) {
        service.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/my")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> deletePlayerReservation(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        service.deletePlayerReservation(id, user.getId());
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

    /**
     * Public endpoint for the front-office chatbot.
     * Returns aggregated booking trends (by day, time slot, room type).
     */
    @GetMapping("/public/booking-trends")
    public ResponseEntity<Map<String, Object>> getBookingTrends() {
        return ResponseEntity.ok(service.getBookingTrends());
    }
}
