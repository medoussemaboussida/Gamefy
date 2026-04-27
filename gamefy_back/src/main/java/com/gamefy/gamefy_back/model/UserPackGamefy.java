package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    /**
     * JSON array of GamefyPackBenefit IDs that are still available for use.
     * e.g. "[1,2,5,8]" — each ID maps to a specific discount benefit.
     */
    @Column(name = "available_discount_ids", columnDefinition = "TEXT")
    private String availableDiscountIds;

    /**
     * JSON map of consumed quantities per FREE_ITEM benefit.
     * Format: {"benefitId": consumedCount, ...}
     * e.g. {"3":1,"7":2} — benefit 3 has 1 unit consumed, benefit 7 has 2 units consumed.
     */
    @Column(name = "consumed_item_quantities", columnDefinition = "TEXT")
    private String consumedItemQuantities;

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

    // --- Helper methods for JSON discount IDs ---

    public List<Integer> getAvailableDiscountIdsList() {
        if (availableDiscountIds == null || availableDiscountIds.isBlank()) return new ArrayList<>();
        String trimmed = availableDiscountIds.replaceAll("[\\[\\]\\s]", "");
        if (trimmed.isEmpty()) return new ArrayList<>();
        List<Integer> ids = new ArrayList<>();
        for (String s : trimmed.split(",")) {
            ids.add(Integer.parseInt(s.trim()));
        }
        return ids;
    }

    public void setAvailableDiscountIdsList(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            this.availableDiscountIds = "[]";
        } else {
            this.availableDiscountIds = ids.toString();
        }
    }

    // --- Helper methods for consumed item quantities (JSON map) ---

    public java.util.Map<Integer, Integer> getConsumedItemQuantitiesMap() {
        java.util.Map<Integer, Integer> map = new java.util.LinkedHashMap<>();
        if (consumedItemQuantities == null || consumedItemQuantities.isBlank()
                || consumedItemQuantities.equals("{}")) {
            return map;
        }
        // Simple JSON map parser for {"3":1,"7":2}
        String trimmed = consumedItemQuantities.replaceAll("[{}\\s]", "");
        if (trimmed.isEmpty()) return map;
        for (String entry : trimmed.split(",")) {
            String[] kv = entry.split(":");
            if (kv.length == 2) {
                int key = Integer.parseInt(kv[0].replaceAll("\"", "").trim());
                int val = Integer.parseInt(kv[1].trim());
                map.put(key, val);
            }
        }
        return map;
    }

    public void setConsumedItemQuantitiesMap(java.util.Map<Integer, Integer> map) {
        if (map == null || map.isEmpty()) {
            this.consumedItemQuantities = "{}";
        } else {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (var entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
                first = false;
            }
            sb.append("}");
            this.consumedItemQuantities = sb.toString();
        }
    }

    public int getConsumedQuantity(Integer benefitId) {
        return getConsumedItemQuantitiesMap().getOrDefault(benefitId, 0);
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
                ", availableDiscountIds=" + availableDiscountIds +
                ", consumedItemQuantities=" + consumedItemQuantities +
                ", status=" + status +
                '}';
    }
}
