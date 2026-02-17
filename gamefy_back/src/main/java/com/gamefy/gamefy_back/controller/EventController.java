package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.EventDto;
import com.gamefy.gamefy_back.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/gamefy/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<EventDto>> getAllEvents() {
        return ResponseEntity.ok(service.getAllEvents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<EventDto> getEventById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto dto) {
        return ResponseEntity.ok(service.createEvent(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Integer id, @RequestBody EventDto dto) {
        return ResponseEntity.ok(service.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        service.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<EventDto> uploadPhoto(@PathVariable Integer id, @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(service.uploadPhoto(id, file));
    }
}
