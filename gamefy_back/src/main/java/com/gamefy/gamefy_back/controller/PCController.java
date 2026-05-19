package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.PcDto;
import com.gamefy.gamefy_back.service.PCService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/gamefy/pcs")
public class PCController {

    private final PCService service;
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<PcDto>> getAllPCs() {
        return ResponseEntity.ok(service.getAllPCs());
    }

    /**
     * Public endpoint for the chatbot — returns PC inventory summary by type and status.
     */
    @GetMapping("/public/summary")
    public ResponseEntity<java.util.Map<String, java.util.Map<String, Long>>> getPcSummaryPublic() {
        return ResponseEntity.ok(service.getPcSummary());
    }
    @GetMapping("/games")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<List<String>> getAllPCGames() {
        return ResponseEntity.ok(service.getAllGamesEnums());
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PcDto> getPCById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPCById(id));
    }
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PcDto> createPC(@Valid @RequestBody PcDto dto) {
        return ResponseEntity.ok(service.createPC(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PcDto> updatePC(@PathVariable Integer id, @Valid @RequestBody PcDto dto) {
        return ResponseEntity.ok(service.updatePC(id, dto));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")   // ← only ADMIN can delete
    public ResponseEntity<Void> deletePC(@PathVariable Integer id) {
        service.deletePC(id);
        return ResponseEntity.noContent().build();
    }
}
