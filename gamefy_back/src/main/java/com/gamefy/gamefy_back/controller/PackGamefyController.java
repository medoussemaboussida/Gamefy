package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.CreatePackGamefyDto;
import com.gamefy.gamefy_back.dto.PackGamefyDto;
import com.gamefy.gamefy_back.service.PackGamefyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pack-gamefies")
@RequiredArgsConstructor
public class PackGamefyController {

    private final PackGamefyService service;

    @GetMapping
    public ResponseEntity<List<PackGamefyDto>> getAllPacks() {
        return ResponseEntity.ok(service.getAllPacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackGamefyDto> getPackById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPackById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PackGamefyDto> createPack(@RequestBody CreatePackGamefyDto dto) {
        return ResponseEntity.ok(service.createPack(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PackGamefyDto> updatePack(@PathVariable Integer id, @RequestBody CreatePackGamefyDto dto) {
        return ResponseEntity.ok(service.updatePack(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePack(@PathVariable Integer id) {
        service.deletePack(id);
        return ResponseEntity.noContent().build();
    }
}
