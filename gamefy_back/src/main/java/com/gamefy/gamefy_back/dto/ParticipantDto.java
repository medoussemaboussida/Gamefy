package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Participant_Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantDto {
    private Integer id;
    private Integer eventId;
    private Integer userId;
    private String firstName;
    private String lastName;
    private Participant_Status participantStatus;
}
