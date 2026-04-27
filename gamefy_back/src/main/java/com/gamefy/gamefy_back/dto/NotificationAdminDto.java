package com.gamefy.gamefy_back.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAdminDto {

    private Integer id;
    private String title;
    private String message;
    private String type;
    private Integer referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
