package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Offer_Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "offer_name", nullable = false)
    private String offerName;

    @Column(nullable = false)
    private Double reduction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Offer_Status status;

    @OneToMany(mappedBy = "offer")
    private List<Reservation> reservations = new ArrayList<>();

    @Override
    public String toString() {
        return "Offer{" +
                "id=" + id +
                ", offerName='" + offerName + '\'' +
                ", reduction=" + reduction +
                ", status=" + status +
                '}';
    }
}

