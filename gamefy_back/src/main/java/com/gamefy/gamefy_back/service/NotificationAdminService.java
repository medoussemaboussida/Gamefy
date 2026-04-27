package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.NotificationAdminDto;
import com.gamefy.gamefy_back.model.NotificationAdmin;
import com.gamefy.gamefy_back.repository.NotificationAdminRepository;
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
public class NotificationAdminService {

    private final NotificationAdminRepository notificationAdminRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Build, persist, and broadcast a notification to all admins/webmasters.
     */
    @Transactional
    public void sendAdminNotification(String playerName, String packName, String type, Integer referenceId) {

        String title = switch (type) {
            case "PACK_GAMEFY_PURCHASED"    -> "Gaming Pack Purchased 💰";
            case "PACK_GAMEFY_RENEWED"      -> "Gaming Pack Renewed 🔄";
            case "PACK_COACHING_PURCHASED"  -> "Coaching Pack Purchased 💰";
            case "PACK_COACHING_RENEWED"    -> "Coaching Pack Renewed 🔄";
            default -> "Pack Payment";
        };

        String message = switch (type) {
            case "PACK_GAMEFY_PURCHASED"    -> playerName + " purchased the gaming pack \"" + packName + "\".";
            case "PACK_GAMEFY_RENEWED"      -> playerName + " renewed the gaming pack \"" + packName + "\".";
            case "PACK_COACHING_PURCHASED"  -> playerName + " purchased the coaching pack \"" + packName + "\".";
            case "PACK_COACHING_RENEWED"    -> playerName + " renewed the coaching pack \"" + packName + "\".";
            default -> playerName + " made a pack payment for \"" + packName + "\".";
        };

        // Persist
        NotificationAdmin notification = NotificationAdmin.builder()
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();

        NotificationAdmin saved = notificationAdminRepository.save(notification);

        // Build DTO (unread for everyone initially)
        NotificationAdminDto dto = mapToDto(saved, null);

        // Broadcast to ALL connected admins/webmasters via topic
        messagingTemplate.convertAndSend("/topic/admin-notifications", dto);

        log.info("Admin notification broadcast: {}", title);
    }

    @Transactional(readOnly = true)
    public List<NotificationAdminDto> getNotifications(Integer adminId) {
        return notificationAdminRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(n -> mapToDto(n, adminId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer adminId) {
        return notificationAdminRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(n -> !n.getReadByUserIds().contains(adminId))
                .count();
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer adminId) {
        NotificationAdmin notification = notificationAdminRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getReadByUserIds().contains(adminId)) {
            notification.getReadByUserIds().add(adminId);
            notificationAdminRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Integer adminId) {
        List<NotificationAdmin> all = notificationAdminRepository.findAllByOrderByCreatedAtDesc();
        for (NotificationAdmin n : all) {
            if (!n.getReadByUserIds().contains(adminId)) {
                n.getReadByUserIds().add(adminId);
            }
        }
        notificationAdminRepository.saveAll(all);
    }

    @Transactional
    public void deleteNotification(Integer notificationId) {
        notificationAdminRepository.deleteById(notificationId);
    }

    @Transactional
    public void deleteAllNotifications() {
        notificationAdminRepository.deleteAll();
    }

    private NotificationAdminDto mapToDto(NotificationAdmin notification, Integer adminId) {
        boolean isRead = adminId != null && notification.getReadByUserIds().contains(adminId);
        return NotificationAdminDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(isRead)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
