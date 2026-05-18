package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PcDto;
import com.gamefy.gamefy_back.exception.GameExceptions.GameNotFoundException;
import com.gamefy.gamefy_back.exception.PcExceptions.PcNotFoundException;
import com.gamefy.gamefy_back.model.PC;
import com.gamefy.gamefy_back.model.PcGame;
import com.gamefy.gamefy_back.model.enums.Location;
import com.gamefy.gamefy_back.model.enums.PC_Status;
import com.gamefy.gamefy_back.model.enums.PC_Type;
import com.gamefy.gamefy_back.repository.PCRepository;
import com.gamefy.gamefy_back.repository.PcGameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for {@link PCService}.
 * All dependencies are mocked — no Spring context needed.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PCService Unit Tests")
class PCServiceTest {

    @Mock  private PCRepository    repository;
    @Mock  private PcGameRepository pcGameRepository;
    @InjectMocks private PCService pcService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private PcGame game(Integer id, String name) {
        PcGame g = new PcGame();
        g.setId(id);
        g.setGameName(name);
        return g;
    }

    private PC buildPc(Integer id, Integer number, PC_Status status, List<PcGame> games) {
        PC pc = new PC();
        pc.setId(id);
        pc.setPcNumber(number);
        pc.setStatus(status);
        pc.setGames(games);
        pc.setPcType(PC_Type.GAMING);
        pc.setPcLocation(Location.SOUKRA);
        pc.setAvailabilities(new ArrayList<>());
        return pc;
    }

    private PcDto buildDto(Integer id, Integer number, PC_Status status, List<String> games) {
        return PcDto.builder()
                .id(id)
                .pcNumber(number)
                .status(status)
                .games(games)
                .pcType(PC_Type.GAMING)
                .pcLocation(Location.SOUKRA)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllPCs()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getAllPCs()")
    class GetAllPCs {

        @Test
        @DisplayName("✅ Returns all PCs as DTOs")
        void getAllPCs_returnsMappedList() {
            given(repository.findAll()).willReturn(List.of(
                    buildPc(1, 1, PC_Status.AVAILABLE,      List.of(game(1, "Valorant"))),
                    buildPc(2, 2, PC_Status.OUT_OF_SERVICE, List.of(game(2, "CS2")))
            ));

            List<PcDto> result = pcService.getAllPCs();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(PcDto::getPcNumber).containsExactly(1, 2);
            assertThat(result.get(0).getGames()).containsExactly("Valorant");
        }

        @Test
        @DisplayName("✅ Empty repository → returns empty list")
        void getAllPCs_empty() {
            given(repository.findAll()).willReturn(List.of());

            assertThat(pcService.getAllPCs()).isEmpty();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllGamesEnums()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getAllGamesEnums()")
    class GetAllGamesEnums {

        @Test
        @DisplayName("✅ Returns all game names from the pcGame table")
        void getAllGamesEnums_returnsNames() {
            given(pcGameRepository.findAll()).willReturn(List.of(
                    game(1, "Fortnite"),
                    game(2, "Apex Legends")));

            List<String> result = pcService.getAllGamesEnums();

            assertThat(result).containsExactly("Fortnite", "Apex Legends");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getPCById()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getPCById()")
    class GetPCById {

        @Test
        @DisplayName("✅ Found → returns correct DTO")
        void getPCById_found_returnsDto() {
            given(repository.findById(1)).willReturn(Optional.of(
                    buildPc(1, 5, PC_Status.AVAILABLE, List.of(game(1, "Minecraft")))));

            PcDto result = pcService.getPCById(1);

            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getPcNumber()).isEqualTo(5);
            assertThat(result.getStatus()).isEqualTo(PC_Status.AVAILABLE);
            assertThat(result.getGames()).containsExactly("Minecraft");
        }

        @Test
        @DisplayName("❌ Not found → PcNotFoundException")
        void getPCById_notFound_throws() {
            given(repository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> pcService.getPCById(99))
                    .isInstanceOf(PcNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  createPC()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createPC()")
    class CreatePC {

        @Test
        @DisplayName("✅ DTO with known games → PC saved and returned as DTO")
        void createPC_success() {
            PcDto dto = buildDto(null, 3, PC_Status.AVAILABLE, List.of("Valorant"));
            PcGame valorant = game(1, "Valorant");

            given(pcGameRepository.findByGameName("Valorant")).willReturn(Optional.of(valorant));
            PC savedPc = buildPc(10, 3, PC_Status.AVAILABLE, List.of(valorant));
            given(repository.save(any(PC.class))).willReturn(savedPc);

            PcDto result = pcService.createPC(dto);

            assertThat(result.getId()).isEqualTo(10);
            assertThat(result.getPcNumber()).isEqualTo(3);
            assertThat(result.getGames()).containsExactly("Valorant");
        }

        @Test
        @DisplayName("❌ Unknown game name in DTO → GameNotFoundException")
        void createPC_unknownGame_throws() {
            PcDto dto = buildDto(null, 3, PC_Status.AVAILABLE, List.of("UnknownGame"));
            given(pcGameRepository.findByGameName("UnknownGame")).willReturn(Optional.empty());

            assertThatThrownBy(() -> pcService.createPC(dto))
                    .isInstanceOf(GameNotFoundException.class)
                    .hasMessageContaining("UnknownGame");

            then(repository).should(never()).save(any());
        }

        @Test
        @DisplayName("✅ DTO with null games list → PC saved without games")
        void createPC_nullGames_savedWithoutGames() {
            PcDto dto = buildDto(null, 4, PC_Status.AVAILABLE, null);
            PC savedPc = buildPc(11, 4, PC_Status.AVAILABLE, List.of());
            given(repository.save(any(PC.class))).willReturn(savedPc);

            PcDto result = pcService.createPC(dto);

            assertThat(result.getId()).isEqualTo(11);
            then(pcGameRepository).should(never()).findByGameName(any());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updatePC()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updatePC()")
    class UpdatePC {

        @Test
        @DisplayName("✅ Valid update → fields updated and saved")
        void updatePC_success() {
            PC existing = buildPc(1, 1, PC_Status.AVAILABLE, new ArrayList<>());
            given(repository.findById(1)).willReturn(Optional.of(existing));

            PcGame cs2 = game(2, "CS2");
            given(pcGameRepository.findByGameName("CS2")).willReturn(Optional.of(cs2));

            PcDto dto = buildDto(1, 7, PC_Status.OUT_OF_SERVICE, List.of("CS2"));
            given(repository.save(existing)).willReturn(existing);

            PcDto result = pcService.updatePC(1, dto);

            assertThat(result.getPcNumber()).isEqualTo(7);
            assertThat(result.getStatus()).isEqualTo(PC_Status.OUT_OF_SERVICE);
            assertThat(result.getGames()).containsExactly("CS2");
        }

        @Test
        @DisplayName("❌ PC not found → PcNotFoundException")
        void updatePC_notFound_throws() {
            given(repository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() ->
                    pcService.updatePC(99, buildDto(99, 1, PC_Status.AVAILABLE, List.of())))
                    .isInstanceOf(PcNotFoundException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("❌ Game in update DTO not found → GameNotFoundException")
        void updatePC_unknownGame_throws() {
            PC existing = buildPc(1, 1, PC_Status.AVAILABLE, new ArrayList<>());
            given(repository.findById(1)).willReturn(Optional.of(existing));
            given(pcGameRepository.findByGameName("Ghost")).willReturn(Optional.empty());

            assertThatThrownBy(() ->
                    pcService.updatePC(1, buildDto(1, 1, PC_Status.AVAILABLE, List.of("Ghost"))))
                    .isInstanceOf(GameNotFoundException.class)
                    .hasMessageContaining("Ghost");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  deletePC()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deletePC()")
    class DeletePC {

        @Test
        @DisplayName("✅ PC exists → deleted")
        void deletePC_success() {
            given(repository.existsById(1)).willReturn(true);

            pcService.deletePC(1);

            then(repository).should().deleteById(1);
        }

        @Test
        @DisplayName("❌ PC not found → PcNotFoundException, no delete called")
        void deletePC_notFound_throws() {
            given(repository.existsById(99)).willReturn(false);

            assertThatThrownBy(() -> pcService.deletePC(99))
                    .isInstanceOf(PcNotFoundException.class)
                    .hasMessageContaining("99");

            then(repository).should(never()).deleteById(any());
        }
    }
}
