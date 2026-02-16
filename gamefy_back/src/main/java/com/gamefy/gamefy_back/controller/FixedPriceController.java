package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.FixedPriceDto;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import com.gamefy.gamefy_back.service.FixedPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamefy/fixed-prices")
@RequiredArgsConstructor
public class FixedPriceController {

    private final FixedPriceService service;

    @GetMapping
    public ResponseEntity<List<FixedPriceDto>> getAllFixedPrices() {
        return ResponseEntity.ok(service.getAllFixedPrices());
    }

    @GetMapping("/{pcType}")
    public ResponseEntity<FixedPriceDto> getFixedPriceByPcType(@PathVariable PC_Type pcType) {
        return ResponseEntity.ok(service.getFixedPriceByPcType(pcType));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<FixedPriceDto> createOrUpdateFixedPrice(@RequestBody FixedPriceDto dto) {
        return ResponseEntity.ok(service.createOrUpdateFixedPrice(dto));
    }
}
