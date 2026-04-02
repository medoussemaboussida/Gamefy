package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Location;
import com.gamefy.gamefy_back.model.enums.PC_Games;
import com.gamefy.gamefy_back.model.enums.PC_Status;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PcDto {

    private Integer id;

    @NotNull(message = "PC number is required")
    @Min(value = 1, message = "PC number must be at least 1")
    private Integer pcNumber;

    @NotNull(message = "Status is required")
    private PC_Status status;

    @NotNull(message = "Games is required")
    private List<PC_Games> games;

    @NotNull(message = "PC Type is required")
    private PC_Type pcType;

    @NotNull(message = "Location is required")
    private Location pcLocation;
}