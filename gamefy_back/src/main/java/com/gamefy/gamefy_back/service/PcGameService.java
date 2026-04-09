package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.repository.PcGameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PcGameService {

    private final PcGameRepository pcGameRepository;

    public List<PcGame> getAllGames() {
        return pcGameRepository.findAll();
    }

    public List<String> getAllGameNames() {
        return pcGameRepository.findAll().stream()
                .map(PcGame::getGameName)
                .collect(Collectors.toList());
    }

    public PcGame getGameById(Integer id) {
        return pcGameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PcGame not found with id: " + id));
    }

    public PcGame createGame(PcGame pcGame) {
        if (pcGameRepository.findByGameName(pcGame.getGameName()).isPresent()) {
            throw new RuntimeException("Game with name " + pcGame.getGameName() + " already exists");
        }
        return pcGameRepository.save(pcGame);
    }

    public PcGame updateGame(Integer id, PcGame pcGame) {
        PcGame existing = getGameById(id);
        
        pcGameRepository.findByGameName(pcGame.getGameName())
                .ifPresent(g -> {
                    if (!g.getId().equals(id)) {
                        throw new RuntimeException("Game with name " + pcGame.getGameName() + " already exists");
                    }
                });

        existing.setGameName(pcGame.getGameName());
        return pcGameRepository.save(existing);
    }

    public void deleteGame(Integer id) {
        if (!pcGameRepository.existsById(id)) {
            throw new RuntimeException("PcGame not found with id: " + id);
        }
        pcGameRepository.deleteById(id);
    }
}
