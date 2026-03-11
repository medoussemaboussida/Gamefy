package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.WorkDaysScheduleDto;
import com.gamefy.gamefy_back.model.WorkDaysSchedule;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import com.gamefy.gamefy_back.repository.WorkDaysScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkDaysScheduleService {

    private final WorkDaysScheduleRepository repository;

    public List<WorkDaysScheduleDto> getAllSchedules() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WorkDaysScheduleDto getScheduleById(Integer id) {
        WorkDaysSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));
        return mapToDto(schedule);
    }

    public WorkDaysScheduleDto createSchedule(WorkDaysScheduleDto dto) {
        // Upsert logic: search by day, month, and year
        return repository.findByDayAndMonthAndYear(dto.getDay(), dto.getMonth(), dto.getYear())
                .map(existing -> {
                    existing.setStartTime(dto.getStartTime());
                    existing.setEndTime(dto.getEndTime());
                    existing.setStatus(dto.getStatus());
                    return mapToDto(repository.save(existing));
                })
                .orElseGet(() -> {
                    WorkDaysSchedule newSchedule = mapToEntity(dto);
                    return mapToDto(repository.save(newSchedule));
                });
    }

    public WorkDaysScheduleDto updateSchedule(Integer id, WorkDaysScheduleDto dto) {
        WorkDaysSchedule existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));
        
        existing.setDay(dto.getDay());
        existing.setMonth(dto.getMonth());
        existing.setYear(dto.getYear());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        existing.setStatus(dto.getStatus());
        
        return mapToDto(repository.save(existing));
    }

    public void deleteSchedule(Integer id) {
        repository.deleteById(id);
    }

    private WorkDaysScheduleDto mapToDto(WorkDaysSchedule schedule) {
        return WorkDaysScheduleDto.builder()
                .id(schedule.getId())
                .day(schedule.getDay())
                .month(schedule.getMonth())
                .year(schedule.getYear())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .status(schedule.getStatus())
                .build();
    }

    private WorkDaysSchedule mapToEntity(WorkDaysScheduleDto dto) {
        WorkDaysSchedule schedule = new WorkDaysSchedule();
        schedule.setId(dto.getId());
        schedule.setDay(dto.getDay());
        schedule.setMonth(dto.getMonth());
        schedule.setYear(dto.getYear());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setStatus(dto.getStatus());
        return schedule;
    }

    public List<WorkDaysScheduleDto> getSchedulesByMonthAndYear(String month, String year) {
        return repository.findByMonthAndYear(month, year).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
