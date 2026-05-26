package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notification_admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Title of the notification */
    @Column(nullable = false)
    private String title;

    /** Detailed message */
    @Column(nullable = false, length = 500)
    private String message;

    /** Notification type, e.g. PACK_GAMEFY_PURCHASED */
    @Column(nullable = false)
    private String type;

    /** Reference to the related entity (e.g. payment ID) */
    private Integer referenceId;

    /**
     * Tracks which admin user IDs have read this notification.
     * Stored as a comma-separated list in the DB for simplicity.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_admin_read_by", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    @Builder.Default
    private List<Integer> readByUserIds = new ArrayList<>();

    /**
     * Tracks which admin user IDs have dismissed (hidden) this notification.
     * The notification is NOT deleted from the DB, just hidden for that user.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_admin_dismissed_by", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    @Builder.Default
    private List<Integer> dismissedByUserIds = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
