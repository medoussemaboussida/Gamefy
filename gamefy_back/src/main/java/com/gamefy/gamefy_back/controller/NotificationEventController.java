package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.NotificationEventDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.NotificationEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamefy/notification-events")
@RequiredArgsConstructor
public class NotificationEventController {

    private final NotificationEventService notificationEventService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<NotificationEventDto>> getNotifications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(notificationEventService.getNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        long count = notificationEventService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationEventService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationEventService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationEventService.deleteNotification(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'COACH', 'ADMIN', 'WEB_MASTER')")
    public ResponseEntity<Void> deleteAllNotifications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationEventService.deleteAllNotifications(user.getId());
        return ResponseEntity.ok().build();
    }
}
