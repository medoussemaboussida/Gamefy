package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Event_Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto {
    private Integer id;
    private String title;
    private String description;
    private String place;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Event_Status eventStatus;
    private String photo;
    private String registerLink;
}
