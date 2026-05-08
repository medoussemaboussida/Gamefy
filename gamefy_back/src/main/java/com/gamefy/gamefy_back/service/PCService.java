package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PcDto;
import com.gamefy.gamefy_back.exception.GameExceptions.GameNotFoundException;
import com.gamefy.gamefy_back.exception.PcExceptions.PcNotFoundException;
import com.gamefy.gamefy_back.model.PC;
import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.repository.PCRepository;
import com.gamefy.gamefy_back.repository.PcGameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PCService {

    private final PCRepository repository;
    private final PcGameRepository pcGameRepository;
    public List<PcDto> getAllPCs() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    public List<String> getAllGamesEnums() {
        return pcGameRepository.findAll().stream()
                .map(PcGame::getGameName)
                .collect(Collectors.toList());
    }

    public PcDto getPCById(Integer id) {
        PC pc = repository.findById(id)
                .orElseThrow(() -> new PcNotFoundException(id));
        return mapToDto(pc);
    }

    public PcDto createPC(PcDto dto) {
        PC pc = mapToEntity(dto);
        pc = repository.save(pc);
        return mapToDto(pc);
    }

    public PcDto updatePC(Integer id, PcDto dto) {
        PC existing = repository.findById(id)
                .orElseThrow(() -> new PcNotFoundException(id));

        existing.setPcNumber(dto.getPcNumber());
        existing.setStatus(dto.getStatus());
        
        List<PcGame> gameEntities = dto.getGames().stream()
                .map(name -> pcGameRepository.findByGameName(name)
                        .orElseThrow(() -> new GameNotFoundException(name)))
                .collect(Collectors.toList());
        existing.setGames(gameEntities);
        
        existing.setPcType(dto.getPcType());
        existing.setPcLocation(dto.getPcLocation());

        existing = repository.save(existing);
        return mapToDto(existing);
    }

    public void deletePC(Integer id) {
        if (!repository.existsById(id)) {
            throw new PcNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private PcDto mapToDto(PC pc) {
        return PcDto.builder()
                .id(pc.getId())
                .pcNumber(pc.getPcNumber())
                .status(pc.getStatus())
                .games(pc.getGames() != null ? pc.getGames().stream().map(PcGame::getGameName).collect(Collectors.toList()) : null)
                .pcType(pc.getPcType())
                .pcLocation(pc.getPcLocation())
                .build();
    }

    private PC mapToEntity(PcDto dto) {
        PC pc = new PC();
        pc.setId(dto.getId());           // usually null on create
        pc.setPcNumber(dto.getPcNumber());
        pc.setStatus(dto.getStatus());
        
        if (dto.getGames() != null) {
            List<PcGame> gameEntities = dto.getGames().stream()
                    .map(name -> pcGameRepository.findByGameName(name)
                            .orElseThrow(() -> new GameNotFoundException(name)))
                    .collect(Collectors.toList());
            pc.setGames(gameEntities);
        }
        
        pc.setPcType(dto.getPcType());
        pc.setPcLocation(dto.getPcLocation());
        return pc;
    }
}
