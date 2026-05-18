package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.OfferDto;
import com.gamefy.gamefy_back.exception.OfferExceptions.OfferNotFoundException;
import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
import com.gamefy.gamefy_back.repository.OfferRepository;
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
 * Unit tests for {@link OfferService}.
 * All dependencies are mocked — no Spring context needed.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OfferService Unit Tests")
class OfferServiceTest {

    @Mock  private OfferRepository repository;
    @InjectMocks private OfferService offerService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Offer buildOffer(Integer id, String name, Double reduction, Offer_Status status) {
        Offer o = new Offer();
        o.setId(id);
        o.setOfferName(name);
        o.setReduction(reduction);
        o.setStatus(status);
        o.setReservations(new ArrayList<>());
        return o;
    }

    private OfferDto buildDto(Integer id, String name, Double reduction, Offer_Status status) {
        return OfferDto.builder()
                .id(id)
                .offerName(name)
                .reduction(reduction)
                .status(status)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getActiveOffer()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getActiveOffer()")
    class GetActiveOffer {

        @Test
        @DisplayName("✅ Active offer exists → returns DTO")
        void getActiveOffer_exists_returnsDto() {
            Offer offer = buildOffer(1, "Summer Sale", 20.0, Offer_Status.ACTIVE);
            given(repository.findFirstByStatus(Offer_Status.ACTIVE)).willReturn(Optional.of(offer));

            OfferDto result = offerService.getActiveOffer();

            assertThat(result).isNotNull();
            assertThat(result.getOfferName()).isEqualTo("Summer Sale");
            assertThat(result.getReduction()).isEqualTo(20.0);
            assertThat(result.getStatus()).isEqualTo(Offer_Status.ACTIVE);
        }

        @Test
        @DisplayName("✅ No active offer → returns null gracefully")
        void getActiveOffer_noActive_returnsNull() {
            given(repository.findFirstByStatus(Offer_Status.ACTIVE)).willReturn(Optional.empty());

            OfferDto result = offerService.getActiveOffer();

            assertThat(result).isNull();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getAllOffers()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getAllOffers()")
    class GetAllOffers {

        @Test
        @DisplayName("✅ Returns all offers as DTOs")
        void getAllOffers_returnsMappedList() {
            given(repository.findAll()).willReturn(List.of(
                    buildOffer(1, "Summer Sale", 20.0, Offer_Status.ACTIVE),
                    buildOffer(2, "Winter Deal", 15.0, Offer_Status.INACTIVE)
            ));

            List<OfferDto> result = offerService.getAllOffers();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(OfferDto::getOfferName)
                    .containsExactly("Summer Sale", "Winter Deal");
        }

        @Test
        @DisplayName("✅ Empty repository → returns empty list")
        void getAllOffers_empty_returnsEmptyList() {
            given(repository.findAll()).willReturn(List.of());

            List<OfferDto> result = offerService.getAllOffers();

            assertThat(result).isEmpty();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  getOfferById()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getOfferById()")
    class GetOfferById {

        @Test
        @DisplayName("✅ Found → returns correct DTO")
        void getOfferById_found_returnsDto() {
            given(repository.findById(1)).willReturn(Optional.of(
                    buildOffer(1, "Flash Offer", 30.0, Offer_Status.ACTIVE)));

            OfferDto result = offerService.getOfferById(1);

            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getOfferName()).isEqualTo("Flash Offer");
            assertThat(result.getReduction()).isEqualTo(30.0);
        }

        @Test
        @DisplayName("❌ Not found → OfferNotFoundException")
        void getOfferById_notFound_throws() {
            given(repository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.getOfferById(99))
                    .isInstanceOf(OfferNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  createOffer()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createOffer()")
    class CreateOffer {

        @Test
        @DisplayName("✅ Valid DTO → entity saved and returned as DTO")
        void createOffer_success_returnsSavedDto() {
            OfferDto dto = buildDto(null, "New Offer", 10.0, Offer_Status.ACTIVE);
            Offer saved = buildOffer(1, "New Offer", 10.0, Offer_Status.ACTIVE);
            given(repository.save(any(Offer.class))).willReturn(saved);

            OfferDto result = offerService.createOffer(dto);

            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getOfferName()).isEqualTo("New Offer");
            assertThat(result.getReduction()).isEqualTo(10.0);
            then(repository).should().save(any(Offer.class));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  updateOffer()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateOffer()")
    class UpdateOffer {

        @Test
        @DisplayName("✅ Existing offer → fields updated and saved")
        void updateOffer_success_returnsUpdatedDto() {
            Offer existing = buildOffer(1, "Old Name", 5.0, Offer_Status.INACTIVE);
            given(repository.findById(1)).willReturn(Optional.of(existing));

            OfferDto updateDto = buildDto(1, "New Name", 25.0, Offer_Status.ACTIVE);
            given(repository.save(existing)).willReturn(existing);

            OfferDto result = offerService.updateOffer(1, updateDto);

            assertThat(result.getOfferName()).isEqualTo("New Name");
            assertThat(result.getReduction()).isEqualTo(25.0);
            assertThat(result.getStatus()).isEqualTo(Offer_Status.ACTIVE);
        }

        @Test
        @DisplayName("❌ Offer not found → OfferNotFoundException")
        void updateOffer_notFound_throws() {
            given(repository.findById(42)).willReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.updateOffer(42, buildDto(null, "X", 5.0, Offer_Status.ACTIVE)))
                    .isInstanceOf(OfferNotFoundException.class)
                    .hasMessageContaining("42");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  deleteOffer()
    // ═══════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteOffer()")
    class DeleteOffer {

        @Test
        @DisplayName("✅ Existing offer → deleted successfully")
        void deleteOffer_success() {
            given(repository.existsById(1)).willReturn(true);

            offerService.deleteOffer(1);

            then(repository).should().deleteById(1);
        }

        @Test
        @DisplayName("❌ Offer not found → OfferNotFoundException, no delete called")
        void deleteOffer_notFound_throws() {
            given(repository.existsById(99)).willReturn(false);

            assertThatThrownBy(() -> offerService.deleteOffer(99))
                    .isInstanceOf(OfferNotFoundException.class)
                    .hasMessageContaining("99");

            then(repository).should(never()).deleteById(any());
        }
    }
}
