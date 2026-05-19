package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.service.PcGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/gamefy/pc-games")
public class PcGameController {

    private final PcGameService pcGameService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER', 'COACH')")
    public ResponseEntity<List<PcGame>> getAllGames() {
        return ResponseEntity.ok(pcGameService.getAllGames());
    }

    /**
     * Public endpoint for the chatbot — returns all game names.
     */
    @GetMapping("/public")
    public ResponseEntity<List<String>> getAllGamesPublic() {
        return ResponseEntity.ok(pcGameService.getAllGames().stream()
                .map(PcGame::getGameName)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<PcGame> getGameById(@PathVariable Integer id) {
        return ResponseEntity.ok(pcGameService.getGameById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PcGame> createGame(@RequestBody PcGame pcGame) {
        return ResponseEntity.ok(pcGameService.createGame(pcGame));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PcGame> updateGame(@PathVariable Integer id, @RequestBody PcGame pcGame) {
        return ResponseEntity.ok(pcGameService.updateGame(id, pcGame));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable Integer id) {
        pcGameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
