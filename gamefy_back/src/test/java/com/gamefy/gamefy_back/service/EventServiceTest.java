package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.EventDto;
import com.gamefy.gamefy_back.exception.EventExceptions.EventNotFoundException;
import com.gamefy.gamefy_back.exception.EventExceptions.EventTimeException;
import com.gamefy.gamefy_back.model.Event;
import com.gamefy.gamefy_back.model.enums.Event_Status;
import com.gamefy.gamefy_back.repository.EventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link EventService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EventService Unit Tests")
class EventServiceTest {

    @Mock private EventRepository repository;
    @Mock private FileService fileService;

    @InjectMocks
    private EventService eventService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Event buildEvent(Integer id, String title, LocalDateTime start, LocalDateTime end) {
        Event event = new Event();
        event.setId(id);
        event.setTitle(title);
        event.setDescription("Description for " + title);
        event.setPlace("Gaming Center");
        event.setStartTime(start);
        event.setEndTime(end);
        event.setEventStatus(Event_Status.SCHEDULED);
        event.setParticipants(new ArrayList<>());
        return event;
    }

    private EventDto buildDto(Integer id, String title, LocalDateTime start, LocalDateTime end) {
        return EventDto.builder()
                .id(id)
                .title(title)
                .description("Description for " + title)
                .place("Gaming Center")
                .startTime(start)
                .endTime(end)
                .eventStatus(Event_Status.SCHEDULED)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllEvents() / getActiveEvents()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Read operations")
    class ReadOperations {

        @Test
        @DisplayName("✅ getAllEvents returns all events")
        void getAllEvents_returnsList() {
            LocalDateTime now = LocalDateTime.now().plusDays(1);
            given(repository.findAll()).willReturn(List.of(
                    buildEvent(1, "Tournament A", now, now.plusHours(2)),
                    buildEvent(2, "Stream Night", now.plusDays(1), now.plusDays(1).plusHours(3))
            ));

            List<EventDto> result = eventService.getAllEvents();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(EventDto::getTitle).containsExactly("Tournament A", "Stream Night");
        }

        @Test
        @DisplayName("✅ getActiveEvents returns only specific statuses")
        void getActiveEvents_filtersByStatus() {
            given(repository.findByEventStatusIn(anyList())).willReturn(List.of(
                    buildEvent(1, "Ongoing Event", LocalDateTime.now(), LocalDateTime.now().plusHours(1))
            ));

            List<EventDto> result = eventService.getActiveEvents();

            assertThat(result).hasSize(1);
            then(repository).should().findByEventStatusIn(argThat(list -> 
                list.contains(Event_Status.SCHEDULED) && 
                list.contains(Event_Status.ONGOING) && 
                list.contains(Event_Status.COMPLETED)
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getEventById()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getEventById()")
    class GetEventById {

        @Test
        @DisplayName("✅ Found → returns DTO")
        void getEventById_found() {
            LocalDateTime start = LocalDateTime.now().plusDays(2);
            given(repository.findById(1)).willReturn(Optional.of(buildEvent(1, "LAN Party", start, start.plusHours(5))));

            EventDto result = eventService.getEventById(1);

            assertThat(result.getTitle()).isEqualTo("LAN Party");
        }

        @Test
        @DisplayName("❌ Not found → EventNotFoundException")
        void getEventById_notFound_throws() {
            given(repository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.getEventById(99))
                    .isInstanceOf(EventNotFoundException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  createEvent()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createEvent()")
    class CreateEvent {

        @Test
        @DisplayName("✅ Valid event → saved effectively")
        void createEvent_success() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            LocalDateTime end = start.plusHours(2);
            EventDto dto = buildDto(null, "New Year Gaming", start, end);
            Event savedEvent = buildEvent(10, "New Year Gaming", start, end);

            given(repository.save(any(Event.class))).willReturn(savedEvent);

            EventDto result = eventService.createEvent(dto);

            assertThat(result.getId()).isEqualTo(10);
            then(repository).should().save(any(Event.class));
        }

        @Test
        @DisplayName("❌ Start time in past → EventTimeException")
        void createEvent_pastStartTime_throws() {
            LocalDateTime pastStart = LocalDateTime.now().minusHours(2);
            EventDto dto = buildDto(null, "Retro Night", pastStart, pastStart.plusHours(4));

            assertThatThrownBy(() -> eventService.createEvent(dto))
                    .isInstanceOf(EventTimeException.class)
                    .hasMessageContaining("past");
        }

        @Test
        @DisplayName("❌ End time before start → EventTimeException")
        void createEvent_endBeforeStart_throws() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            EventDto dto = buildDto(null, "Broken Event", start, start.minusHours(1));

            assertThatThrownBy(() -> eventService.createEvent(dto))
                    .isInstanceOf(EventTimeException.class)
                    .hasMessageContaining("after");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updateEvent()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateEvent()")
    class UpdateEvent {

        @Test
        @DisplayName("✅ Existing event → partial update works")
        void updateEvent_success() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            Event existing = buildEvent(1, "Old Title", start, start.plusHours(2));
            given(repository.findById(1)).willReturn(Optional.of(existing));
            given(repository.save(any(Event.class))).willReturn(existing);

            EventDto updateDto = EventDto.builder().title("Updated Title").build();

            EventDto result = eventService.updateEvent(1, updateDto);

            assertThat(result.getTitle()).isEqualTo("Updated Title");
            assertThat(result.getStartTime()).isEqualTo(start); // kept from existing
        }

        @Test
        @DisplayName("❌ Update to invalid times → EventTimeException")
        void updateEvent_invalidTimes_throws() {
            Event existing = buildEvent(1, "X", LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(1));
            given(repository.findById(1)).willReturn(Optional.of(existing));

            EventDto badDto = EventDto.builder()
                    .startTime(LocalDateTime.now().plusHours(5))
                    .endTime(LocalDateTime.now().plusHours(2)) // end before start
                    .build();

            assertThatThrownBy(() -> eventService.updateEvent(1, badDto))
                    .isInstanceOf(EventTimeException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  uploadPhoto()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("uploadPhoto()")
    class UploadPhoto {

        @Test
        @DisplayName("✅ Photo upload → saved via FileService and path stored")
        void uploadPhoto_success() throws IOException {
            Event event = buildEvent(1, "Tournament", LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(2));
            given(repository.findById(1)).willReturn(Optional.of(event));
            given(fileService.saveEventPhoto(any())).willReturn("uploads/events/photo.jpg");
            given(repository.save(any())).willReturn(event);

            MultipartFile mockFile = mock(MultipartFile.class);
            EventDto result = eventService.uploadPhoto(1, mockFile);

            assertThat(result.getPhoto()).isEqualTo("uploads/events/photo.jpg");
            then(fileService).should().saveEventPhoto(mockFile);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  deleteEvent()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteEvent()")
    class DeleteEvent {

        @Test
        @DisplayName("✅ Event exists → deleted")
        void deleteEvent_success() {
            given(repository.existsById(1)).willReturn(true);

            eventService.deleteEvent(1);

            then(repository).should().deleteById(1);
        }

        @Test
        @DisplayName("❌ Event not found → EventNotFoundException")
        void deleteEvent_notFound_throws() {
            given(repository.existsById(99)).willReturn(false);

            assertThatThrownBy(() -> eventService.deleteEvent(99))
                    .isInstanceOf(EventNotFoundException.class);
        }
    }
}
