package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import com.gamefy.gamefy_back.model.enums.WorkDayStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkDaysScheduleDto {
    private Integer id;
    private DayOfWeek day;
    private String month;
    private String year;
    private LocalTime startTime;
    private LocalTime endTime;
    private WorkDayStatus status;
}
