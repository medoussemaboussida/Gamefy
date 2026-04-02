package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PcDto;
import com.gamefy.gamefy_back.model.PC;
import com.gamefy.gamefy_back.model.enums.PC_Games;
import com.gamefy.gamefy_back.repository.PCRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PCService {

    private final PCRepository repository;
    public List<PcDto> getAllPCs() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    public List<String> getAllGamesEnums() {
        return Arrays.stream(PC_Games.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public PcDto getPCById(Integer id) {
        PC pc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("PC not found with id: " + id));
        return mapToDto(pc);
    }

    public PcDto createPC(PcDto dto) {
        PC pc = mapToEntity(dto);
        pc = repository.save(pc);
        return mapToDto(pc);
    }

    public PcDto updatePC(Integer id, PcDto dto) {
        PC existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("PC not found with id: " + id));

        existing.setPcNumber(dto.getPcNumber());
        existing.setStatus(dto.getStatus());
        existing.setGames(dto.getGames());
        existing.setPcType(dto.getPcType());
        existing.setPcLocation(dto.getPcLocation());

        existing = repository.save(existing);
        return mapToDto(existing);
    }

    public void deletePC(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("PC not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private PcDto mapToDto(PC pc) {
        return PcDto.builder()
                .id(pc.getId())
                .pcNumber(pc.getPcNumber())
                .status(pc.getStatus())
                .games(pc.getGames())
                .pcType(pc.getPcType())
                .pcLocation(pc.getPcLocation())
                .build();
    }

    private PC mapToEntity(PcDto dto) {
        PC pc = new PC();
        pc.setId(dto.getId());           // usually null on create
        pc.setPcNumber(dto.getPcNumber());
        pc.setStatus(dto.getStatus());
        pc.setGames(dto.getGames());
        pc.setPcType(dto.getPcType());
        pc.setPcLocation(dto.getPcLocation());
        return pc;
    }
}
