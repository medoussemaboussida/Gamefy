package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Participant_Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "participant_status", nullable = false)
    private Participant_Status participantStatus;

    @Override
    public String toString() {
        return "Participant{" +
                "id=" + id +
                ", eventId=" + (event != null ? event.getId() : null) +
                ", userId=" + (user != null ? user.getId() : null) +
                ", participantStatus=" + participantStatus +
                '}';
    }
}
