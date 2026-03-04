package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Event_Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Title is required")
    @Size(min = 5, message = "Title must be at least 5 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 5, message = "Description must be at least 5 characters")
    private String description;

    @NotBlank(message = "Place is required")
    private String place;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private Event_Status eventStatus;
    private String photo;
    private String registerLink;
}
