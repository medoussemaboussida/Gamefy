package com.gamefy.gamefy_back.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantId implements Serializable {

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "event_id")
    private Integer eventId;
}

