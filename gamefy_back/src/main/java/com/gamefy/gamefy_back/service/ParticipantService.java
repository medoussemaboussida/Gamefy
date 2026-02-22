package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.ParticipantDto;
import com.gamefy.gamefy_back.model.Event;
import com.gamefy.gamefy_back.model.Participant;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Participant_Status;
import com.gamefy.gamefy_back.repository.EventRepository;
import com.gamefy.gamefy_back.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public List<ParticipantDto> getMyParticipations(User user) {
        return participantRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<ParticipantDto> getParticipantsByEventId(Integer eventId) {
        return participantRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public ParticipantDto participate(Integer eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        Optional<Participant> existing = participantRepository.findByEventIdAndUserId(eventId, user.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("User is already a participant of this event");
        }

        Participant participant = new Participant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setParticipantStatus(Participant_Status.PENDING);

        return mapToDto(participantRepository.save(participant));
    }

    public ParticipantDto cancelParticipation(Integer eventId, User user) {
        Participant participant = participantRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new RuntimeException("Participation not found for this event"));

        ParticipantDto dto = mapToDto(participant);
        participantRepository.delete(participant);
        return dto;
    }

    public ParticipantDto updateParticipantStatus(Integer participantId, Participant_Status status) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + participantId));
        participant.setParticipantStatus(status);
        return mapToDto(participantRepository.save(participant));
    }

    private ParticipantDto mapToDto(Participant participant) {
        return ParticipantDto.builder()
                .id(participant.getId())
                .eventId(participant.getEvent().getId())
                .userId(participant.getUser().getId())
                .firstName(participant.getUser().getFirstName())
                .lastName(participant.getUser().getLastName())
                .participantStatus(participant.getParticipantStatus())
                .build();
    }
}
