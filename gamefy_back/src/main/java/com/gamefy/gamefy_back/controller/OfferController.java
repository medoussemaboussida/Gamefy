package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.OfferDto;
import com.gamefy.gamefy_back.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/gamefy/offers")
public class OfferController {

    private final OfferService service;
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<OfferDto>> getAllOffers() {
        return ResponseEntity.ok(service.getAllOffers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<OfferDto> getOfferById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getOfferById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<OfferDto> createOffer(@RequestBody OfferDto dto) {
        return ResponseEntity.ok(service.createOffer(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<OfferDto> updateOffer(@PathVariable Integer id, @RequestBody OfferDto dto) {
        return ResponseEntity.ok(service.updateOffer(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // only ADMIN can delete
    public ResponseEntity<Void> deleteOffer(@PathVariable Integer id) {
        service.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }

}
