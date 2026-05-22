package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.OfferDto;
import com.gamefy.gamefy_back.exception.OfferExceptions.OfferNotFoundException;
import com.gamefy.gamefy_back.model.Offer;
import com.gamefy.gamefy_back.model.enums.Offer_Status;
import com.gamefy.gamefy_back.repository.OfferRepository;
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
public class OfferService {

    private final OfferRepository repository;

    @Cacheable(value = "offers", key = "'active'")
    public OfferDto getActiveOffer() {
        return repository.findFirstByStatus(Offer_Status.ACTIVE)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Cacheable(value = "offers")
    public List<OfferDto> getAllOffers() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OfferDto getOfferById(Integer id) {
        Offer offer = repository.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));
        return mapToDto(offer);
    }

    @CacheEvict(value = "offers", allEntries = true)
    public OfferDto createOffer(OfferDto dto) {
        Offer offer = mapToEntity(dto);
        offer = repository.save(offer);
        return mapToDto(offer);
    }

    @CacheEvict(value = "offers", allEntries = true)
    public OfferDto updateOffer(Integer id, OfferDto dto) {
        Offer existing = repository.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));

        existing.setOfferName(dto.getOfferName());
        existing.setReduction(dto.getReduction());
        existing.setStatus(dto.getStatus());

        existing = repository.save(existing);
        return mapToDto(existing);
    }

    @CacheEvict(value = "offers", allEntries = true)
    public void deleteOffer(Integer id) {
        if (!repository.existsById(id)) {
            throw new OfferNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private OfferDto mapToDto(Offer offer) {
        return OfferDto.builder()
                .id(offer.getId())
                .offerName(offer.getOfferName())
                .reduction(offer.getReduction())
                .status(offer.getStatus())
                .build();
    }

    private Offer mapToEntity(OfferDto dto) {
        Offer offer = new Offer();
        offer.setId(dto.getId()); // null on create
        offer.setOfferName(dto.getOfferName());
        offer.setReduction(dto.getReduction());
        offer.setStatus(dto.getStatus());
        return offer;
    }

}
