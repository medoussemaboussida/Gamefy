package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.ParticipantDto;
import com.gamefy.gamefy_back.emailManager.EmailService;
import com.gamefy.gamefy_back.model.Event;
import com.gamefy.gamefy_back.model.Participant;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.model.enums.Participant_Status;
import com.gamefy.gamefy_back.repository.EventRepository;
import com.gamefy.gamefy_back.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;
    private final NotificationEventService notificationEventService;

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

    public byte[] exportParticipantsToExcel(Integer eventId) throws IOException {
        List<Participant> participants = participantRepository.findByEventId(eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Participants - " + event.getTitle());

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "First Name", "Last Name", "Email", "Status"};
            
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Fill Data Rows
            int rowIdx = 1;
            for (Participant participant : participants) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(participant.getId());
                row.createCell(1).setCellValue(participant.getUser().getFirstName());
                row.createCell(2).setCellValue(participant.getUser().getLastName());
                row.createCell(3).setCellValue(participant.getUser().getEmail());
                row.createCell(4).setCellValue(participant.getParticipantStatus().toString());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
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

        ParticipantDto dto = mapToDto(participantRepository.save(participant));

        // Send participation confirmation email
        emailService.sendEventParticipationEmail(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                event.getTitle()
        );

        return dto;
    }

    public ParticipantDto cancelParticipation(Integer eventId, User user) {
        Participant participant = participantRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new RuntimeException("Participation not found for this event"));

        ParticipantDto dto = mapToDto(participant);
        String eventTitle = participant.getEvent().getTitle();
        participantRepository.delete(participant);

        // Send cancellation email
        emailService.sendEventCancellationEmail(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                eventTitle
        );

        return dto;
    }

    public ParticipantDto updateParticipantStatus(Integer participantId, Participant_Status status) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + participantId));

        Participant_Status oldStatus = participant.getParticipantStatus();
        participant.setParticipantStatus(status);
        Participant saved = participantRepository.save(participant);

        // Send real-time notification to the participant
        notificationEventService.sendParticipantStatusNotification(saved, oldStatus, status);

        return mapToDto(saved);
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
