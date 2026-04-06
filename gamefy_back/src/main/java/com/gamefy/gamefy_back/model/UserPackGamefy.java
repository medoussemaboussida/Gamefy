package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_pack_gamefy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPackGamefy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_gamefy_id", nullable = false)
    private PackGamefy packGamefy;

    @Column(name = "activated_at", nullable = false)
    private LocalDateTime activatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "remaining_pc_hours")
    private Double remainingPcHours;

    @Column(name = "remaining_vip_hours")
    private Double remainingVipHours;

    @Column(name = "remaining_coaching_hours")
    private Double remainingCoachingHours;

    @Column(name = "remaining_pc_discounts")
    private Integer remainingPcDiscounts;

    @Column(name = "remaining_vip_discounts")
    private Integer remainingVipDiscounts;

    @Column(name = "remaining_coaching_discounts")
    private Integer remainingCoachingDiscounts;

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
        return "UserPackGamefy{" +
                "id=" + id +
                ", activatedAt=" + activatedAt +
                ", expiresAt=" + expiresAt +
                ", remainingPcHours=" + remainingPcHours +
                ", remainingVipHours=" + remainingVipHours +
                ", remainingCoachingHours=" + remainingCoachingHours +
                ", remainingPcDiscounts=" + remainingPcDiscounts +
                ", remainingVipDiscounts=" + remainingVipDiscounts +
                ", remainingCoachingDiscounts=" + remainingCoachingDiscounts +
                ", status=" + status +
                '}';
    }
}
