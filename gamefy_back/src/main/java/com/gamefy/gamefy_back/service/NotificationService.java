package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.NotificationDto;
import com.gamefy.gamefy_back.model.Notification;
import com.gamefy.gamefy_back.model.Reservation;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Reservation_Status;
import com.gamefy.gamefy_back.repository.NotificationRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;


    /**
     * Build, persist, and push a real-time notification when a reservation status changes.
     */
    @Transactional
    public void sendReservationStatusNotification(Reservation reservation,
                                                   Reservation_Status oldStatus,
                                                   Reservation_Status newStatus) {
        if (oldStatus == newStatus) return;

        User player = reservation.getPlayer();
        String type = "RESERVATION_" + newStatus.name();

        String title = switch (newStatus) {
            case CONFIRMED -> "Reservation Confirmed ✅";
            case CANCELLED -> "Reservation Cancelled ❌";
            case PENDING   -> "Reservation Set to Pending ⏳";
        };

        String roomType = reservation.getReservationType().name().replace("_", " ");

        String message = switch (newStatus) {
            case CONFIRMED -> "Your " + roomType + " reservation on {{time}} has been confirmed. See you there!";
            case CANCELLED -> "Your " + roomType + " reservation on {{time}} has been cancelled.";
            case PENDING   -> "Your " + roomType + " reservation on {{time}} has been set back to pending.";
        };

        // Persist
        Notification notification = Notification.builder()
                .user(player)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(reservation.getId())
                .scheduledAt(reservation.getStartTime()) // Set the raw UTC time
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = mapToDto(saved);

        // Push via WebSocket to the specific user
        String destination = "/queue/notifications";
        messagingTemplate.convertAndSendToUser(
                String.valueOf(player.getId()),
                destination,
                dto
        );

        log.info("Notification sent to user ID={}: {}", player.getId(), title);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .scheduledAt(notification.getScheduledAt())
                .build();
    }
}
