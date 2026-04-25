package com.gamefy.gamefy_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEventDto {
    private Integer id;
    private Integer userId;
    private String title;
    private String message;
    private String type;
    private Integer referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
