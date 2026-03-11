package com.gamefy.gamefy_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.model.enums.Reservation_Status;
import com.gamefy.gamefy_back.model.enums.Reservation_Type;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private User coach;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @Column(name = "coach_location")
    private String coachLocation;

    @Column(name = "player_location")
    private String playerLocation;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private Payment_Type paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reservation_type", nullable = false)
    private Reservation_Type reservationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Reservation_Status status;

    @Column(name = "price_time")
    private Double priceTime;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    private Offer offer;

    @JsonIgnore
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "reservation")
    private List<PcAvailability> pcAvailabilities = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "reservation")
    private List<CoachingSlot> coachingSlots = new ArrayList<>();

    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", coach=" + coach +
                ", player=" + player +
                ", coachLocation='" + coachLocation + '\'' +
                ", playerLocation='" + playerLocation + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", paymentType=" + paymentType +
                ", reservationType=" + reservationType +
                ", status=" + status +
                ", priceTime=" + priceTime +
                ", offer=" + offer +
                ", payments=" + payments +
                ", pcAvailabilities=" + pcAvailabilities +
                ", coachingSlots=" + coachingSlots +
                '}';
    }
}

