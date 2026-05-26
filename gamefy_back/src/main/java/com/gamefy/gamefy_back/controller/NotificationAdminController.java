package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.NotificationAdminDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.NotificationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamefy/notification-admins")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
public class NotificationAdminController {

    private final NotificationAdminService notificationAdminService;

    @GetMapping
    public ResponseEntity<List<NotificationAdminDto>> getNotifications(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(notificationAdminService.getNotifications(currentUser.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        long count = notificationAdminService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser) {
        notificationAdminService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal User currentUser) {
        notificationAdminService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser) {
        notificationAdminService.dismissNotification(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(
            @AuthenticationPrincipal User currentUser) {
        notificationAdminService.dismissAllNotifications(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
