package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreatePackGamefyDto;
import com.gamefy.gamefy_back.dto.PackGamefyDto;
import com.gamefy.gamefy_back.model.GamefyPackBenefit;
import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.UserPackGamefy;
import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import com.gamefy.gamefy_back.model.enums.UserPackStatus;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.PackGamefyRepository;
import com.gamefy.gamefy_back.repository.PaymentRepository;
import com.gamefy.gamefy_back.repository.UserPackGamefyRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackGamefyService {

    private final PackGamefyRepository repository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final UserPackGamefyRepository userPackGamefyRepository;

    public List<PackGamefyDto> getAllPacks() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PackGamefyDto getPackById(Integer id) {
        PackGamefy pack = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + id));
        return mapToDto(pack);
    }

    @Transactional
    public PackGamefyDto createPack(CreatePackGamefyDto dto) {
        PackGamefy pack = new PackGamefy();
        pack.setName(dto.getName());
        pack.setPrice(dto.getPrice());
        pack.setDescription(dto.getDescription());
        pack.setDurationMonths(dto.getDurationMonths());

        if (dto.getBenefits() != null) {
            List<GamefyPackBenefit> benefits = dto.getBenefits().stream()
                    .map(b -> {
                        GamefyPackBenefit benefit = new GamefyPackBenefit();
                        benefit.setBenefitType(Benefit_type.valueOf(b.getBenefitType()));
                        benefit.setRateRule(Rate_Rule.valueOf(b.getRateRule()));
                        benefit.setPackGamefy(pack);
                        return benefit;
                    }).collect(Collectors.toList());
            pack.setBenefits(benefits);
        }

        return mapToDto(repository.save(pack));
    }

    @Transactional
    public PackGamefyDto updatePack(Integer id, CreatePackGamefyDto dto) {
        PackGamefy pack = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + id));

        pack.setName(dto.getName());
        pack.setPrice(dto.getPrice());
        pack.setDescription(dto.getDescription());
        if (dto.getDurationMonths() != null) {
            pack.setDurationMonths(dto.getDurationMonths());
        }

        // Update benefits
        pack.getBenefits().clear();
        if (dto.getBenefits() != null) {
            List<GamefyPackBenefit> benefits = dto.getBenefits().stream()
                    .map(b -> {
                        GamefyPackBenefit benefit = new GamefyPackBenefit();
                        benefit.setBenefitType(Benefit_type.valueOf(b.getBenefitType()));
                        benefit.setRateRule(Rate_Rule.valueOf(b.getRateRule()));
                        benefit.setPackGamefy(pack);
                        return benefit;
                    }).collect(Collectors.toList());
            pack.getBenefits().addAll(benefits);
        }

        return mapToDto(repository.save(pack));
    }

    @Transactional
    public void deletePack(Integer id) {
        PackGamefy pack = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + id));

        // Remove all junction records for this pack
        List<UserPackGamefy> junctionRecords = userPackGamefyRepository.findByPackGamefy(pack);
        userPackGamefyRepository.deleteAll(junctionRecords);

        repository.delete(pack);
    }

    private PackGamefyDto mapToDto(PackGamefy pack) {
        List<PackGamefyDto.PackBenefitDto> benefitsDto = pack.getBenefits().stream()
                .map(b -> new PackGamefyDto.PackBenefitDto(
                        b.getId(),
                        b.getBenefitType().name(),
                        b.getRateRule().name()
                )).collect(Collectors.toList());

        return PackGamefyDto.builder()
                .id(pack.getId())
                .name(pack.getName())
                .price(pack.getPrice())
                .description(pack.getDescription())
                .durationMonths(pack.getDurationMonths())
                .benefits(benefitsDto)
                .build();
    }

    @Transactional
    @CacheEvict(value = {"users"}, allEntries = true)
    public void assignPackToUser(Integer packId, Integer userId) {
        log.info("Service: Assigning packId {} to userId {}", packId, userId);
        PackGamefy pack = repository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + packId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Create junction record
        UserPackGamefy userPack = new UserPackGamefy();
        userPack.setUser(user);
        userPack.setPackGamefy(pack);
        userPack.setActivatedAt(LocalDateTime.now());
        userPack.setExpiresAt(LocalDateTime.now().plusMonths(pack.getDurationMonths()));
        userPack.setRemainingPcHours(calculatePcHours(pack));
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);
    }

    @Transactional
    @CacheEvict(value = {"users", "payments"}, allEntries = true)
    public void removePackFromUser(Integer userId) {
        log.info("Service: Removing pack from userId {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Find and delete active junction records for this user
        List<UserPackGamefy> activeRecords = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);
        userPackGamefyRepository.deleteAll(activeRecords);
    }

    /**
     * Count the number of PC + HOURS benefits in the pack.
     * Each such benefit = 1 PC hour.
     */
    private double calculatePcHours(PackGamefy pack) {
        if (pack.getBenefits() == null) return 0.0;
        return pack.getBenefits().stream()
                .filter(b -> b.getBenefitType() == Benefit_type.PC && b.getRateRule() == Rate_Rule.HOURS)
                .count();
    }
}
