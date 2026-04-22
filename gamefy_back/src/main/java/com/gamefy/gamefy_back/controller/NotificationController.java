package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.NotificationDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamefy/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
