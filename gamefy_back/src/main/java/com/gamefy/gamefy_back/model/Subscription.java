package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false, unique = true)
    private User player;

    @Column(name = "total_hours", nullable = false)
    private Integer totalHours;

    @Override
    public String toString() {
        return "Subscription{" +
                "id=" + id +
                ", player=" + (player != null ? player.getId() : null) +
                ", totalHours=" + totalHours +
                '}';
    }
}

