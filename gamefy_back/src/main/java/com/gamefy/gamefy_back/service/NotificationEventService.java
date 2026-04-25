package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.NotificationEventDto;
import com.gamefy.gamefy_back.model.NotificationEvent;
import com.gamefy.gamefy_back.model.Participant;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Participant_Status;
import com.gamefy.gamefy_back.repository.NotificationEventRepository;
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
public class NotificationEventService {

    private final NotificationEventRepository notificationEventRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Build, persist, and push a real-time notification when a participant status changes.
     */
    @Transactional
    public void sendParticipantStatusNotification(Participant participant,
                                                   Participant_Status oldStatus,
                                                   Participant_Status newStatus) {
        if (oldStatus == newStatus) return;

        User player = participant.getUser();
        String eventTitle = participant.getEvent().getTitle();
        String type = "PARTICIPANT_" + newStatus.name();

        String title = switch (newStatus) {
            case CONFIRMED -> "Event Participation Confirmed ✅";
            case CANCELLED -> "Event Participation Cancelled ❌";
            case PENDING   -> "Event Participation Set to Pending ⏳";
        };

        String message = switch (newStatus) {
            case CONFIRMED -> "Your participation in \"" + eventTitle + "\" has been confirmed. See you there!";
            case CANCELLED -> "Your participation in \"" + eventTitle + "\" has been cancelled.";
            case PENDING   -> "Your participation in \"" + eventTitle + "\" has been set back to pending.";
        };

        // Persist
        NotificationEvent notification = NotificationEvent.builder()
                .user(player)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(participant.getId())
                .isRead(false)
                .build();

        NotificationEvent saved = notificationEventRepository.save(notification);
        NotificationEventDto dto = mapToDto(saved);

        // Push via WebSocket to the specific user
        String destination = "/queue/notifications";
        messagingTemplate.convertAndSendToUser(
                String.valueOf(player.getId()),
                destination,
                dto
        );

        log.info("Event notification sent to user ID={}: {}", player.getId(), title);
    }

    @Transactional(readOnly = true)
    public List<NotificationEventDto> getNotifications(Integer userId) {
        return notificationEventRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return notificationEventRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        NotificationEvent notification = notificationEventRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notification.setRead(true);
        notificationEventRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        List<NotificationEvent> unread = notificationEventRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationEventRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer userId) {
        NotificationEvent notification = notificationEventRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notificationEventRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Integer userId) {
        List<NotificationEvent> all = notificationEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationEventRepository.deleteAll(all);
    }

    private NotificationEventDto mapToDto(NotificationEvent notification) {
        return NotificationEventDto.builder()
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
