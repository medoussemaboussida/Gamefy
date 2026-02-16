package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.WorkDaysScheduleDto;
import com.gamefy.gamefy_back.service.WorkDaysScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/work-days-schedules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
public class WorkDaysScheduleController {

    private final WorkDaysScheduleService service;

    @GetMapping
    public ResponseEntity<List<WorkDaysScheduleDto>> getAllSchedules() {
        return ResponseEntity.ok(service.getAllSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkDaysScheduleDto> getScheduleById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getScheduleById(id));
    }

    @PostMapping
    public ResponseEntity<WorkDaysScheduleDto> createSchedule(@RequestBody WorkDaysScheduleDto dto) {
        return ResponseEntity.ok(service.createSchedule(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkDaysScheduleDto> updateSchedule(@PathVariable Integer id, @RequestBody WorkDaysScheduleDto dto) {
        return ResponseEntity.ok(service.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Integer id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
