package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PackCoachingDto;
import com.gamefy.gamefy_back.model.PackCoaching;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.PackCoachingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PackCoachingService {

    private final PackCoachingRepository repository;

    public List<PackCoachingDto> getPacksByCoachId(Integer coachId) {
        return repository.findByCoachId(coachId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PackCoachingDto getPackById(Integer id, User coach) {
        PackCoaching pack = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found"));
        
        // Ownership check
        if (!pack.getCoach().getId().equals(coach.getId())) {
            throw new RuntimeException("You don't have permission to view this pack");
        }
        
        return mapToDto(pack);
    }

    public PackCoachingDto createPack(PackCoachingDto dto, User coach) {
        PackCoaching pack = mapToEntity(dto);
        pack.setCoach(coach);
        pack = repository.save(pack);
        return mapToDto(pack);
    }

    public PackCoachingDto updatePack(Integer id, PackCoachingDto dto, User coach) {
        PackCoaching existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found"));
        
        if (!existing.getCoach().getId().equals(coach.getId())) {
            throw new RuntimeException("You don't have permission to update this pack");
        }

        existing.setName(dto.getName());
        existing.setHours(dto.getHours());
        existing.setPrice(dto.getPrice());
        existing.setDescription(dto.getDescription());

        existing = repository.save(existing);
        return mapToDto(existing);
    }

    public void deletePack(Integer id, User coach) {
        PackCoaching existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found"));
        
        if (!existing.getCoach().getId().equals(coach.getId())) {
            throw new RuntimeException("You don't have permission to delete this pack");
        }

        repository.delete(existing);
    }

    private PackCoachingDto mapToDto(PackCoaching pack) {
        return PackCoachingDto.builder()
                .id(pack.getId())
                .name(pack.getName())
                .hours(pack.getHours())
                .price(pack.getPrice())
                .description(pack.getDescription())
                .coachId(pack.getCoach() != null ? pack.getCoach().getId() : null)
                .build();
    }

    private PackCoaching mapToEntity(PackCoachingDto dto) {
        PackCoaching pack = new PackCoaching();
        pack.setName(dto.getName());
        pack.setHours(dto.getHours());
        pack.setPrice(dto.getPrice());
        pack.setDescription(dto.getDescription());
        return pack;
    }
}
