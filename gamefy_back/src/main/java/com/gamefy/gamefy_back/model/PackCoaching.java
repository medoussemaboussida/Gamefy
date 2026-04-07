package com.gamefy.gamefy_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "pack_coaching")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackCoaching {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalTime hours;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private User coach;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @JsonIgnore
    @OneToMany(mappedBy = "packCoaching")
    private java.util.List<Payment> payments = new java.util.ArrayList<>();

    @Override
    public String toString() {
        return "PackCoaching{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", hours=" + hours +
                ", price=" + price +
                '}';
    }
}

