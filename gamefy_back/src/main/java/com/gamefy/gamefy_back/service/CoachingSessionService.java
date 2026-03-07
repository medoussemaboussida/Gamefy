package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CoachingSessionDto;
import com.gamefy.gamefy_back.model.CoachingSession;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.DayOfWeek;
import com.gamefy.gamefy_back.repository.CoachingSessionRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CoachingSessionService {

    private final CoachingSessionRepository repository;
    private final UserRepository userRepository;

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
}
