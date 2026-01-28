package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pc_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PcAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pc_id", nullable = false)
    private PC pc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Override
    public String toString() {
        return "PcAvailability{" +
                "id=" + id +
                ", pc=" + pc +
                ", reservation=" + reservation +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                '}';
    }
}

