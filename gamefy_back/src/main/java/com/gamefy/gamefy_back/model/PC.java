package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Location;
import com.gamefy.gamefy_back.model.enums.PC_Status;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "pc_number", nullable = false)
    private Integer pcNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PC_Status status;

    @ManyToMany
    @JoinTable(
            name = "pc_games_relation",
            joinColumns = @JoinColumn(name = "pc_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private List<PcGame> games;

    @Enumerated(EnumType.STRING)
    @Column(name = "pc_type", nullable = false)
    private PC_Type pcType;

    @Enumerated(EnumType.STRING)
    @Column(name = "pc_location")
    private Location pcLocation;

    @OneToMany(mappedBy = "pc", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PcAvailability> availabilities = new ArrayList<>();

    @Override
    public String toString() {
        return "PC{" +
                "id=" + id +
                ", pcNumber=" + pcNumber +
                ", status=" + status +
                ", games=" + games +
                ", pcType=" + pcType +
                ", pcLocation=" + pcLocation +
                '}';
    }
}

