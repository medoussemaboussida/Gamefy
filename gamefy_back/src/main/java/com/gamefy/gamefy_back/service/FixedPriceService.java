package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.FixedPriceDto;
import com.gamefy.gamefy_back.model.FixedPrice;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import com.gamefy.gamefy_back.repository.FixedPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FixedPriceService {

    private final FixedPriceRepository repository;

    public List<FixedPriceDto> getAllFixedPrices() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FixedPriceDto getFixedPriceByPcType(PC_Type pcType) {
        FixedPrice fixedPrice = repository.findAll().stream()
                .filter(fp -> fp.getPcType() == pcType)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Fixed price not found for type: " + pcType));
        return mapToDto(fixedPrice);
    }

    public FixedPriceDto createOrUpdateFixedPrice(FixedPriceDto dto) {
        // Upsert logic: find existing by PC type
        return repository.findAll().stream()
                .filter(fp -> fp.getPcType() == dto.getPcType())
                .findFirst()
                .map(existing -> {
                    existing.setOneHourPrice(dto.getOneHourPrice());
                    existing.setTwoHoursPrice(dto.getTwoHoursPrice());
                    existing.setThreeHoursPrice(dto.getThreeHoursPrice());
                    return mapToDto(repository.save(existing));
                })
                .orElseGet(() -> {
                    FixedPrice newPrice = mapToEntity(dto);
                    return mapToDto(repository.save(newPrice));
                });
    }

    private FixedPriceDto mapToDto(FixedPrice entity) {
        return FixedPriceDto.builder()
                .id(entity.getId())
                .oneHourPrice(entity.getOneHourPrice())
                .twoHoursPrice(entity.getTwoHoursPrice())
                .threeHoursPrice(entity.getThreeHoursPrice())
                .pcType(entity.getPcType())
                .build();
    }

    private FixedPrice mapToEntity(FixedPriceDto dto) {
        FixedPrice entity = new FixedPrice();
        entity.setId(dto.getId());
        entity.setOneHourPrice(dto.getOneHourPrice());
        entity.setTwoHoursPrice(dto.getTwoHoursPrice());
        entity.setThreeHoursPrice(dto.getThreeHoursPrice());
        entity.setPcType(dto.getPcType());
        return entity;
    }
}
