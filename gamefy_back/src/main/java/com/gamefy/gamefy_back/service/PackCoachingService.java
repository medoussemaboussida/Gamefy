package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.PackCoachingAdminDto;
import com.gamefy.gamefy_back.dto.PackCoachingDto;
import com.gamefy.gamefy_back.model.PackCoaching;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.PackCoachingRepository;
import com.gamefy.gamefy_back.repository.PaymentRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PackCoachingService {

    private final PackCoachingRepository repository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public List<PackCoachingDto> getPacksByCoachId(Integer coachId) {
        return repository.findByCoachId(coachId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PackCoachingAdminDto> getAllPacks() {
        return repository.findAll().stream()
                .map(this::mapToAdminDto)
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

    public void deletePackAdmin(Integer id) {
        PackCoaching existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found"));
        repository.delete(existing);
    }

    @Transactional
    @CacheEvict(value = {"users"}, allEntries = true)
    public void assignPackToPlayer(Integer packId, Integer userId) {
        PackCoaching pack = repository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Coaching pack not found with id: " + packId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setPackCoaching(pack);
        userRepository.save(user);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackCoaching(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);
    }

    @Transactional
    @CacheEvict(value = {"users"}, allEntries = true)
    public void removePackFromPlayer(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setPackCoaching(null);
        userRepository.save(user);
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

    private PackCoachingAdminDto mapToAdminDto(PackCoaching pack) {
        return PackCoachingAdminDto.builder()
                .id(pack.getId())
                .name(pack.getName())
                .hours(pack.getHours())
                .price(pack.getPrice())
                .description(pack.getDescription())
                .coachId(pack.getCoach() != null ? pack.getCoach().getId() : null)
                .coachName(pack.getCoach() != null ? 
                        pack.getCoach().getFirstName() + " " + pack.getCoach().getLastName() : "Unknown")
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
