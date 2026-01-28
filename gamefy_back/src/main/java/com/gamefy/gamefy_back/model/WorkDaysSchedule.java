package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_days_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkDaysSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private String year;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Override
    public String toString() {
        return "WorkDaysSchedule{" +
                "id=" + id +
                ", month='" + month + '\'' +
                ", year='" + year + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                '}';
    }
}

