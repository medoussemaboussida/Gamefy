package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.NotificationReservationDto;
import com.gamefy.gamefy_back.model.NotificationReservation;
import com.gamefy.gamefy_back.model.Reservation;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Reservation_Status;
import com.gamefy.gamefy_back.repository.NotificationReservationRepository;
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
public class NotificationReservationService {

    private final NotificationReservationRepository notificationReservationRepository;
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
        NotificationReservation notification = NotificationReservation.builder()
                .user(player)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(reservation.getId())
                .scheduledAt(reservation.getStartTime()) // Set the raw UTC time
                .isRead(false)
                .build();

        NotificationReservation saved = notificationReservationRepository.save(notification);
        NotificationReservationDto dto = mapToDto(saved);

        // Push via WebSocket to the specific user
        String destination = "/queue/notifications";
        messagingTemplate.convertAndSendToUser(
                String.valueOf(player.getId()),
                destination,
                dto
        );

        log.info("Notification sent to user ID={}: {}", player.getId(), title);
    }

    /**
     * Send a notification to the coach when a coaching reservation is created, confirmed, or cancelled.
     * @param reservation the coaching reservation
     * @param eventType one of "NEW", "CONFIRMED", "CANCELLED", "PENDING"
     */
    @Transactional
    public void sendCoachReservationNotification(Reservation reservation, String eventType) {
        User coach = reservation.getCoach();
        if (coach == null) return; // Not a coaching reservation

        String playerName = reservation.getPlayer().getFirstName() + " " + reservation.getPlayer().getLastName();

        String title = switch (eventType) {
            case "NEW"       -> "New Coaching Session 🎮";
            case "CONFIRMED" -> "Coaching Session Confirmed ✅";
            case "CANCELLED" -> "Coaching Session Cancelled ❌";
            case "PENDING"   -> "Coaching Session Set to Pending ⏳";
            default          -> "Coaching Session Update";
        };

        String message = switch (eventType) {
            case "NEW"       -> playerName + " booked a coaching session with you on {{time}}";
            case "CONFIRMED" -> "Your coaching session with " + playerName + " on {{time}} has been confirmed";
            case "CANCELLED" -> "The coaching session with " + playerName + " on {{time}} has been cancelled";
            case "PENDING"   -> "Your coaching session with " + playerName + " on {{time}} has been set back to pending";
            default          -> "Your coaching session with " + playerName + " on {{time}} has been updated";
        };

        String type = "COACHING_RESERVATION_" + eventType;

        NotificationReservation notification = NotificationReservation.builder()
                .user(coach)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(reservation.getId())
                .scheduledAt(reservation.getStartTime())
                .isRead(false)
                .build();

        NotificationReservation saved = notificationReservationRepository.save(notification);
        NotificationReservationDto dto = mapToDto(saved);

        // Push via WebSocket to the coach
        messagingTemplate.convertAndSendToUser(
                String.valueOf(coach.getId()),
                "/queue/notifications",
                dto
        );

        log.info("Coach notification sent to coach ID={}: {}", coach.getId(), title);
    }

    @Transactional(readOnly = true)
    public List<NotificationReservationDto> getNotifications(Integer userId) {
        return notificationReservationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return notificationReservationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        NotificationReservation notification = notificationReservationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notification.setRead(true);
        notificationReservationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        List<NotificationReservation> unread = notificationReservationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationReservationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer userId) {
        NotificationReservation notification = notificationReservationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("This notification does not belong to you");
        }

        notificationReservationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Integer userId) {
        List<NotificationReservation> all = notificationReservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationReservationRepository.deleteAll(all);
    }

    private NotificationReservationDto mapToDto(NotificationReservation notification) {
        return NotificationReservationDto.builder()
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
