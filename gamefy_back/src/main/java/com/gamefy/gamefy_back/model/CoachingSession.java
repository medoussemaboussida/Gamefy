package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.CoachingSessionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coaching_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachingSessionStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private User coach;

    @OneToMany(mappedBy = "coachingSession")
    private List<CoachingSlot> coachingSlots = new ArrayList<>();

    @Override
    public String toString() {
        return "CoachingSession{" +
                "id=" + id +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", status=" + status +
                ", coach=" + coach +
                '}';
    }
}

