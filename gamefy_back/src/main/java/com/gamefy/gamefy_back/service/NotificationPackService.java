package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.NotificationPackDto;
import com.gamefy.gamefy_back.model.NotificationPack;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.NotificationPackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPackService {

    private final NotificationPackRepository notificationPackRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Build, persist, and push a real-time notification for pack changes.
     */
    @Transactional
    public void sendPackNotification(User user, String packName, String type, Integer referenceId) {

        String title = switch (type) {
            case "PACK_GAMEFY_ASSIGNED"   -> "Gaming Pack Assigned 🎮";
            case "PACK_GAMEFY_REMOVED"    -> "Gaming Pack Removed ⚠️";
            case "PACK_GAMEFY_RENEWED"    -> "Gaming Pack Renewed 🔄";
            case "PACK_COACHING_ASSIGNED" -> "Coaching Pack Assigned 🏋️";
            case "PACK_COACHING_REMOVED"  -> "Coaching Pack Removed ⚠️";
            case "PACK_COACHING_RENEWED"  -> "Coaching Pack Renewed 🔄";
            default -> "Pack Update";
        };

        String message = switch (type) {
            case "PACK_GAMEFY_ASSIGNED"   -> "The gaming pack \"" + packName + "\" has been assigned to your account.";
            case "PACK_GAMEFY_REMOVED"    -> "The gaming pack \"" + packName + "\" has been removed from your account.";
            case "PACK_GAMEFY_RENEWED"    -> "Your gaming pack \"" + packName + "\" has been renewed with fresh benefits!";
            case "PACK_COACHING_ASSIGNED" -> "The coaching pack \"" + packName + "\" has been assigned to your account.";
            case "PACK_COACHING_REMOVED"  -> "The coaching pack \"" + packName + "\" has been removed from your account.";
            case "PACK_COACHING_RENEWED"  -> "Your coaching pack \"" + packName + "\" has been renewed with fresh hours!";
            default -> "Your pack \"" + packName + "\" has been updated.";
        };

        // Persist
        NotificationPack notification = NotificationPack.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        NotificationPack saved = notificationPackRepository.save(notification);
        NotificationPackDto dto = mapToDto(saved);

        // Push via WebSocket to the specific user
        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/queue/notifications",
                dto
        );

        log.info("Pack notification sent to user ID={}: {}", user.getId(), title);
    }

    @Transactional(readOnly = true)
    public List<NotificationPackDto> getNotifications(Integer userId) {
        return notificationPackRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return notificationPackRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        NotificationPack notification = notificationPackRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notification.setRead(true);
        notificationPackRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        List<NotificationPack> unread = notificationPackRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationPackRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer userId) {
        NotificationPack notification = notificationPackRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notificationPackRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Integer userId) {
        List<NotificationPack> all = notificationPackRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationPackRepository.deleteAll(all);
    }

    private NotificationPackDto mapToDto(NotificationPack notification) {
        return NotificationPackDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
