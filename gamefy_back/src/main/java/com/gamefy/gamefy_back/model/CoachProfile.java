package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coach_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false, unique = true)
    private User coach;

    @Column(nullable = false)
    private String game;

    @Column(name = "hourly_price", nullable = false)
    private Double hourlyPrice;

    @Override
    public String toString() {
        return "CoachProfile{" +
                "id=" + id +
                ", coach=" + (coach != null ? coach.getId() : null) +
                ", game='" + game + '\'' +
                ", hourlyPrice=" + hourlyPrice +
                '}';
    }
}

