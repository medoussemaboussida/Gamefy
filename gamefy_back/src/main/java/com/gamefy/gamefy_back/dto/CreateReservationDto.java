package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Reservation_Type;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationDto {
    private Reservation_Type reservationType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Integer> pcIds;
    private Double priceTime;
    private Integer coachId;
    private String game;
}
