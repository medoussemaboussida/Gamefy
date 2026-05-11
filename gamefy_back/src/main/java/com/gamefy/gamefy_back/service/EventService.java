package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.EventDto;
import com.gamefy.gamefy_back.exception.EventExceptions.*;
import com.gamefy.gamefy_back.model.Event;
import com.gamefy.gamefy_back.model.enums.Event_Status;
import com.gamefy.gamefy_back.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository repository;
    private final FileService fileService;

    public List<EventDto> getAllEvents() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getActiveEvents() {
        return repository.findByEventStatusIn(
                List.of(Event_Status.SCHEDULED, Event_Status.ONGOING, Event_Status.COMPLETED)
        ).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Integer id) {
        Event event = repository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return mapToDto(event);
    }

    public EventDto createEvent(EventDto dto) {
        validateEventTimes(dto.getStartTime(), dto.getEndTime());
        Event event = mapToEntity(dto);
        return mapToDto(repository.save(event));
    }

    public EventDto updateEvent(Integer id, EventDto dto) {
        Event existing = repository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        // Use current values if not provided in dto
        java.time.LocalDateTime start = dto.getStartTime() != null ? dto.getStartTime() : existing.getStartTime();
        java.time.LocalDateTime end = dto.getEndTime() != null ? dto.getEndTime() : existing.getEndTime();
        
        // Only validate if times are being changed or it's a new validation
        if (dto.getStartTime() != null || dto.getEndTime() != null) {
            validateEventTimes(start, end);
        }

        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getPlace() != null) existing.setPlace(dto.getPlace());
        if (dto.getStartTime() != null) existing.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) existing.setEndTime(dto.getEndTime());
        if (dto.getEventStatus() != null) existing.setEventStatus(dto.getEventStatus());
        if (dto.getPhoto() != null) existing.setPhoto(dto.getPhoto());
        if (dto.getRegisterLink() != null) existing.setRegisterLink(dto.getRegisterLink());

        return mapToDto(repository.save(existing));
    }

    public void deleteEvent(Integer id) {
        if (!repository.existsById(id)) {
            throw new EventNotFoundException(id);
        }
        repository.deleteById(id);
    }

    public EventDto uploadPhoto(Integer id, MultipartFile file) throws IOException {
        Event event = repository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        String photoPath = fileService.saveEventPhoto(file);
        event.setPhoto(photoPath);
        return mapToDto(repository.save(event));
    }

    private EventDto mapToDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .place(event.getPlace())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .eventStatus(event.getEventStatus())
                .photo(event.getPhoto())
                .registerLink(event.getRegisterLink())
                .build();
    }

    private Event mapToEntity(EventDto dto) {
        Event event = new Event();
        event.setId(dto.getId());
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setPlace(dto.getPlace());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setEventStatus(dto.getEventStatus());
        event.setPhoto(dto.getPhoto());
        event.setRegisterLink(dto.getRegisterLink());
        return event;
    }

    private void validateEventTimes(java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (startTime == null || endTime == null) return;

        if (startTime.isBefore(now.minusMinutes(1))) { // 1 min buffer for network
            throw new EventTimeException("Event start time cannot be in the past");
        }
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new EventTimeException("Event end time must be after the start time");
        }
    }
}
