package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.model.enums.Reservation_Status;
import com.gamefy.gamefy_back.model.enums.Reservation_Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDto implements Serializable {
    private Integer id;
    private Reservation_Type reservationType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Reservation_Status status;
    private List<Integer> pcNumbers;
    private List<Integer> pcIds;
    private String playerName;
    private Double priceTime;
    private Payment_Type paymentType;
    private LocalDateTime createdAt;
    private Integer coachId;
    private String coachName;
    private String game;
}
