package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.exception.GameExceptions.GameAlreadyExistsException;
import com.gamefy.gamefy_back.exception.GameExceptions.GameNotFoundException;
import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.repository.PcGameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PcGameService {

    private final PcGameRepository pcGameRepository;

    @Cacheable(value = "games")
    public List<PcGame> getAllGames() {
        return pcGameRepository.findAll();
    }

    @Cacheable(value = "games", key = "'names'")
    public List<String> getAllGameNames() {
        return pcGameRepository.findAll().stream()
                .map(PcGame::getGameName)
                .collect(Collectors.toList());
    }

    public PcGame getGameById(Integer id) {
        return pcGameRepository.findById(id)
                .orElseThrow(() -> new GameNotFoundException(id.toString()));
    }

    @CacheEvict(value = {"games", "pcs"}, allEntries = true)
    public PcGame createGame(PcGame pcGame) {
        if (pcGameRepository.findByGameName(pcGame.getGameName()).isPresent()) {
            throw new GameAlreadyExistsException(pcGame.getGameName());
        }
        return pcGameRepository.save(pcGame);
    }

    @CacheEvict(value = {"games", "pcs"}, allEntries = true)
    public PcGame updateGame(Integer id, PcGame pcGame) {
        PcGame existing = getGameById(id);
        
        pcGameRepository.findByGameName(pcGame.getGameName())
                .ifPresent(g -> {
                    if (!g.getId().equals(id)) {
                        throw new GameAlreadyExistsException(pcGame.getGameName());
                    }
                });

        existing.setGameName(pcGame.getGameName());
        return pcGameRepository.save(existing);
    }

    @CacheEvict(value = {"games", "pcs"}, allEntries = true)
    public void deleteGame(Integer id) {
        if (!pcGameRepository.existsById(id)) {
            throw new GameNotFoundException(id.toString());
        }
        pcGameRepository.deleteById(id);
    }
}
