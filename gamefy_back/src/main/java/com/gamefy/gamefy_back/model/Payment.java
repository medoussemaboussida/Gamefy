package com.gamefy.gamefy_back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;

    @Column(name = "coach_cut")
    private Double coachCut;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_gamefy_id", unique = true)
    private PackGamefy packGamefy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_coaching_id", unique = true)
    private PackCoaching packCoaching;

    @Override
    public String toString() {
        return "Payment{" +
                "id=" + id +
                ", reservation=" + (reservation != null ? reservation.getId() : null) +
                ", coachCut=" + coachCut +
                ", totalPrice=" + totalPrice +
                ", packGamefy=" + (packGamefy != null ? packGamefy.getId() : null) +
                ", packCoaching=" + (packCoaching != null ? packCoaching.getId() : null) +
                '}';
    }
}

