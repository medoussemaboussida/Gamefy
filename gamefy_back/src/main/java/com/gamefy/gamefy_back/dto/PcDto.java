package com.gamefy.gamefy_back.dto;

import com.gamefy.gamefy_back.model.enums.Location;
import com.gamefy.gamefy_back.model.enums.PC_Games;
import com.gamefy.gamefy_back.model.enums.PC_Status;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PcDto {

    private Integer id;
    private Integer pcNumber;
    private PC_Status status;
    private PC_Games games;
    private PC_Type pcType;
    private Location pcLocation;
}