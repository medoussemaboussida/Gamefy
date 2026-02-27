package com.gamefy.gamefy_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pack_gamefy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackGamefy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "text")
    private String description;

    @OneToMany(mappedBy = "packGamefy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GamefyPackBenefit> benefits = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "packGamefy")
    private List<User> users = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "packGamefy")
    private List<Payment> payments = new ArrayList<>();

    @Override
    public String toString() {
        return "PackGamefy{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", description='" + description + '\'' +
                '}';
    }
}

