package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import com.gamefy.gamefy_back.model.enums.WorkDayStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "work_days_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkDaysSchedule {

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
    private WorkDayStatus status;

    @Override
    public String toString() {
        return "WorkDaysSchedule{" +
                "id=" + id +
                ", day=" + day +
                ", month='" + month + '\'' +
                ", year='" + year + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                '}';
    }
}

