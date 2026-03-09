package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Payment_Type;
import com.gamefy.gamefy_back.model.enums.Reservation_Status;
import com.gamefy.gamefy_back.model.enums.Reservation_Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDto {
    private Integer id;
    private Reservation_Type reservationType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Payment_Type paymentType;
    private Reservation_Status status;
    private List<Integer> pcNumbers;
    private String playerName;
    private Double priceTime;
    private List<Integer> pcIds;
}
