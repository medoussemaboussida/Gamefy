package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_pack_coaching")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPackCoaching {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_coaching_id", nullable = false)
    private PackCoaching packCoaching;

    @Column(name = "activated_at", nullable = false)
    private LocalDateTime activatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "remaining_hours")
    private Double remainingHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserPackStatus status;

    @PrePersist
    protected void onCreate() {
        if (this.activatedAt == null) {
            this.activatedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = UserPackStatus.ACTIVE;
        }
    }

    @Override
    public String toString() {
        return "UserPackCoaching{" +
                "id=" + id +
                ", activatedAt=" + activatedAt +
                ", expiresAt=" + expiresAt +
                ", remainingHours=" + remainingHours +
                ", status=" + status +
                '}';
    }
}
