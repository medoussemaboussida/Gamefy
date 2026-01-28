package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coaching_slot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_session_id", nullable = false)
    private CoachingSession coachingSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Override
    public String toString() {
        return "CoachingSlot{" +
                "id=" + id +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", coachingSession=" + (coachingSession != null ? coachingSession.getId() : null) +
                ", reservation=" + (reservation != null ? reservation.getId() : null) +
                '}';
    }
}
