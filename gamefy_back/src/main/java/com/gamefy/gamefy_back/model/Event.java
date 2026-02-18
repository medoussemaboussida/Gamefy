package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Event_Status;
import com.gamefy.gamefy_back.model.enums.Participant_Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String place;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status", nullable = false)
    private Event_Status eventStatus;

    private String photo;

    @Column(name = "register_link")
    private String registerLink;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants = new ArrayList<>();

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", place='" + place + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", eventStatus=" + eventStatus +
                ", photo='" + photo + '\'' +
                ", registerLink='" + registerLink + '\'' +
                '}';
    }
}

