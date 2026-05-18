package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.exception.GameExceptions.GameAlreadyExistsException;
import com.gamefy.gamefy_back.exception.GameExceptions.GameNotFoundException;
import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.repository.PcGameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link PcGameService}.
 * All dependencies are mocked — no Spring context needed.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PcGameService Unit Tests")
class PcGameServiceTest {

    @Mock  private PcGameRepository pcGameRepository;
    @InjectMocks private PcGameService pcGameService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private PcGame game(Integer id, String name) {
        PcGame g = new PcGame();
        g.setId(id);
        g.setGameName(name);
        return g;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllGames()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getAllGames()")
    class GetAllGames {

        @Test
        @DisplayName("✅ Returns all PcGame entities")
        void getAllGames_returnsList() {
            given(pcGameRepository.findAll()).willReturn(List.of(
                    game(1, "Counter-Strike 2"),
                    game(2, "Valorant")));

            List<PcGame> result = pcGameService.getAllGames();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(PcGame::getGameName)
                    .containsExactly("Counter-Strike 2", "Valorant");
        }

        @Test
        @DisplayName("✅ Empty repository → returns empty list")
        void getAllGames_empty() {
            given(pcGameRepository.findAll()).willReturn(List.of());

            assertThat(pcGameService.getAllGames()).isEmpty();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllGameNames()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getAllGameNames()")
    class GetAllGameNames {

        @Test
        @DisplayName("✅ Returns list of game name strings")
        void getAllGameNames_returnsNames() {
            given(pcGameRepository.findAll()).willReturn(List.of(
                    game(1, "Fortnite"),
                    game(2, "League of Legends")));

            List<String> result = pcGameService.getAllGameNames();

            assertThat(result).containsExactly("Fortnite", "League of Legends");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getGameById()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getGameById()")
    class GetGameById {

        @Test
        @DisplayName("✅ Found → returns game entity")
        void getGameById_found() {
            given(pcGameRepository.findById(1)).willReturn(Optional.of(game(1, "Minecraft")));

            PcGame result = pcGameService.getGameById(1);

            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getGameName()).isEqualTo("Minecraft");
        }

        @Test
        @DisplayName("❌ Not found → GameNotFoundException")
        void getGameById_notFound_throws() {
            given(pcGameRepository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> pcGameService.getGameById(99))
                    .isInstanceOf(GameNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  createGame()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createGame()")
    class CreateGame {

        @Test
        @DisplayName("✅ New game name → saved and returned")
        void createGame_success() {
            PcGame newGame = game(null, "Apex Legends");
            PcGame savedGame = game(5, "Apex Legends");

            given(pcGameRepository.findByGameName("Apex Legends")).willReturn(Optional.empty());
            given(pcGameRepository.save(newGame)).willReturn(savedGame);

            PcGame result = pcGameService.createGame(newGame);

            assertThat(result.getId()).isEqualTo(5);
            assertThat(result.getGameName()).isEqualTo("Apex Legends");
        }

        @Test
        @DisplayName("❌ Duplicate game name → GameAlreadyExistsException")
        void createGame_duplicate_throws() {
            PcGame existingGame = game(1, "Valorant");
            given(pcGameRepository.findByGameName("Valorant")).willReturn(Optional.of(existingGame));

            assertThatThrownBy(() -> pcGameService.createGame(game(null, "Valorant")))
                    .isInstanceOf(GameAlreadyExistsException.class)
                    .hasMessageContaining("Valorant");

            then(pcGameRepository).should(never()).save(any());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updateGame()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateGame()")
    class UpdateGame {

        @Test
        @DisplayName("✅ Valid update with a new unique name → saved")
        void updateGame_success_newName() {
            PcGame existing = game(1, "OldGame");
            given(pcGameRepository.findById(1)).willReturn(Optional.of(existing));
            given(pcGameRepository.findByGameName("NewGame")).willReturn(Optional.empty());
            given(pcGameRepository.save(existing)).willReturn(existing);

            PcGame update = game(null, "NewGame");
            PcGame result = pcGameService.updateGame(1, update);

            assertThat(result.getGameName()).isEqualTo("NewGame");
        }

        @Test
        @DisplayName("✅ Same name on same game (no real rename) → no conflict")
        void updateGame_sameNameSameId_success() {
            PcGame existing = game(1, "SameGame");
            given(pcGameRepository.findById(1)).willReturn(Optional.of(existing));
            // findByGameName returns the SAME game — id matches, so no conflict
            given(pcGameRepository.findByGameName("SameGame")).willReturn(Optional.of(existing));
            given(pcGameRepository.save(existing)).willReturn(existing);

            PcGame result = pcGameService.updateGame(1, game(null, "SameGame"));

            assertThat(result.getGameName()).isEqualTo("SameGame");
        }

        @Test
        @DisplayName("❌ Name already taken by a different game → GameAlreadyExistsException")
        void updateGame_nameTakenByOtherGame_throws() {
            PcGame existing  = game(1, "OldGame");
            PcGame otherGame = game(2, "TakenName");

            given(pcGameRepository.findById(1)).willReturn(Optional.of(existing));
            given(pcGameRepository.findByGameName("TakenName")).willReturn(Optional.of(otherGame));

            assertThatThrownBy(() -> pcGameService.updateGame(1, game(null, "TakenName")))
                    .isInstanceOf(GameAlreadyExistsException.class)
                    .hasMessageContaining("TakenName");
        }

        @Test
        @DisplayName("❌ Game to update not found → GameNotFoundException")
        void updateGame_notFound_throws() {
            given(pcGameRepository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> pcGameService.updateGame(99, game(null, "X")))
                    .isInstanceOf(GameNotFoundException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  deleteGame()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteGame()")
    class DeleteGame {

        @Test
        @DisplayName("✅ Game exists → deleted")
        void deleteGame_success() {
            given(pcGameRepository.existsById(1)).willReturn(true);

            pcGameService.deleteGame(1);

            then(pcGameRepository).should().deleteById(1);
        }

        @Test
        @DisplayName("❌ Game not found → GameNotFoundException, no delete called")
        void deleteGame_notFound_throws() {
            given(pcGameRepository.existsById(99)).willReturn(false);

            assertThatThrownBy(() -> pcGameService.deleteGame(99))
                    .isInstanceOf(GameNotFoundException.class);

            then(pcGameRepository).should(never()).deleteById(any());
        }
    }
}
