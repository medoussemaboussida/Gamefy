package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CoachingSessionDto;
import com.gamefy.gamefy_back.model.CoachingSession;
import com.gamefy.gamefy_back.model.WorkDaysSchedule;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.CoachingSessionStatus;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import com.gamefy.gamefy_back.model.enums.WorkDayStatus;
import com.gamefy.gamefy_back.repository.CoachingSessionRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import com.gamefy.gamefy_back.repository.WorkDaysScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CoachingSessionService {

    private final CoachingSessionRepository repository;
    private final UserRepository userRepository;
    private final WorkDaysScheduleRepository workDaysScheduleRepository;

    public List<CoachingSessionDto> getAllSchedules() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CoachingSessionDto> getSchedulesByCoach(Integer coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found with id: " + coachId));
        return repository.findByCoach(coach).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CoachingSessionDto getScheduleById(Integer id) {
        CoachingSession session = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coaching session not found with id: " + id));
        return mapToDto(session);
    }

    public CoachingSessionDto createSchedule(CoachingSessionDto dto) {
        if (dto.getCoachId() == null) {
            throw new RuntimeException("Coach ID must not be null");
        }
        validateSessionAgainstPlatformSchedule(dto);
        User coach = userRepository.findById(dto.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found with id: " + dto.getCoachId()));

        // Upsert logic: search by coach, day, month, and year
        return repository.findByCoachAndDayAndMonthAndYear(coach, dto.getDay(), dto.getMonth(), dto.getYear())
                .map(existing -> {
                    existing.setStartTime(dto.getStartTime());
                    existing.setEndTime(dto.getEndTime());
                    existing.setStatus(dto.getStatus());
                    return mapToDto(repository.save(existing));
                })
                .orElseGet(() -> {
                    CoachingSession newSession = mapToEntity(dto, coach);
                    return mapToDto(repository.save(newSession));
                });
    }

    public CoachingSessionDto updateSchedule(Integer id, CoachingSessionDto dto) {
        CoachingSession existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coaching session not found with id: " + id));

        Integer coachId = dto.getCoachId() != null ? dto.getCoachId() : existing.getCoach().getId();
        dto.setCoachId(coachId);
        validateSessionAgainstPlatformSchedule(dto);

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

    private CoachingSessionDto mapToDto(CoachingSession session) {
        return CoachingSessionDto.builder()
                .id(session.getId())
                .day(session.getDay())
                .month(session.getMonth())
                .year(session.getYear())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .status(session.getStatus())
                .coachId(session.getCoach().getId())
                .build();
    }

    private CoachingSession mapToEntity(CoachingSessionDto dto, User coach) {
        CoachingSession session = new CoachingSession();
        session.setId(dto.getId());
        session.setDay(dto.getDay());
        session.setMonth(dto.getMonth());
        session.setYear(dto.getYear());
        session.setStartTime(dto.getStartTime());
        session.setEndTime(dto.getEndTime());
        session.setStatus(dto.getStatus());
        session.setCoach(coach);
        return session;
    }

    private void validateSessionAgainstPlatformSchedule(CoachingSessionDto dto) {
        if (dto.getDay() == null || dto.getMonth() == null || dto.getYear() == null) {
            throw new RuntimeException("Day, month and year are required");
        }

        WorkDaysSchedule platformSchedule = workDaysScheduleRepository
                .findByDayAndMonthAndYear(dto.getDay(), dto.getMonth(), dto.getYear())
                .orElseThrow(() -> new RuntimeException(
                        "No platform working schedule configured for " + dto.getDay() + " in " + dto.getMonth() + " " + dto.getYear()
                ));

        boolean wantsAvailable = dto.getStatus() == CoachingSessionStatus.AVAILABLE;

        if (wantsAvailable && platformSchedule.getStatus() != WorkDayStatus.OPEN) {
            throw new RuntimeException("Platform is closed on " + dto.getDay() + ". Coach availability cannot be set on closed days");
        }

        // For NOT_AVAILABLE, time interval rules are irrelevant.
        if (!wantsAvailable) {
            return;
        }

        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }
        if (dto.getStartTime().equals(dto.getEndTime())) {
            throw new RuntimeException("Session start and end time cannot be equal");
        }

        boolean fitsWorkingWindow = isIntervalInsideWindow(
                dto.getStartTime(),
                dto.getEndTime(),
                platformSchedule.getStartTime(),
                platformSchedule.getEndTime()
        );

        if (!fitsWorkingWindow) {
            throw new RuntimeException(
                    "Coach availability must be inside platform working hours: "
                            + platformSchedule.getStartTime() + " - " + platformSchedule.getEndTime()
            );
        }
    }

    private boolean isIntervalInsideWindow(LocalTime intervalStart, LocalTime intervalEnd, LocalTime windowStart, LocalTime windowEnd) {
        int windowDurationMinutes = minutesForward(windowStart, windowEnd);
        if (windowDurationMinutes <= 0) {
            return false;
        }

        int intervalDurationMinutes = minutesForward(intervalStart, intervalEnd);
        if (intervalDurationMinutes <= 0) {
            return false;
        }

        int intervalStartOffset = minutesForward(windowStart, intervalStart);
        int intervalEndOffset = intervalStartOffset + intervalDurationMinutes;

        return intervalStartOffset < windowDurationMinutes && intervalEndOffset <= windowDurationMinutes;
    }

    private int minutesForward(LocalTime from, LocalTime to) {
        int fromMinutes = from.getHour() * 60 + from.getMinute();
        int toMinutes = to.getHour() * 60 + to.getMinute();
        int diff = toMinutes - fromMinutes;
        return diff >= 0 ? diff : diff + (24 * 60);
    }
}
