package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.CoachingSessionStatus;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "coaching_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek day;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private String year;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachingSessionStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private User coach;

    @Override
    public String toString() {
        return "CoachingSession{" +
                "id=" + id +
                ", day=" + day +
                ", month='" + month + '\'' +
                ", year='" + year + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", status=" + status +
                '}';
    }
}
