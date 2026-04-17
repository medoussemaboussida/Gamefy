package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreatePackGamefyDto;
import com.gamefy.gamefy_back.dto.PackGamefyDto;
import com.gamefy.gamefy_back.model.GamefyPackBenefit;
import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.UserPackGamefy;
import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.DiscountType;
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
import java.util.Optional;
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
                        if (b.getDiscountType() != null) {
                            benefit.setDiscountType(DiscountType.valueOf(b.getDiscountType()));
                        }
                        benefit.setDiscountValue(b.getDiscountValue());
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
                        if (b.getDiscountType() != null) {
                            benefit.setDiscountType(DiscountType.valueOf(b.getDiscountType()));
                        }
                        benefit.setDiscountValue(b.getDiscountValue());
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
                .map(b -> {
                    PackGamefyDto.PackBenefitDto dto = new PackGamefyDto.PackBenefitDto();
                    dto.setId(b.getId());
                    dto.setBenefitType(b.getBenefitType().name());
                    dto.setRateRule(b.getRateRule().name());
                    dto.setDiscountType(b.getDiscountType() != null ? b.getDiscountType().name() : null);
                    dto.setDiscountValue(b.getDiscountValue());
                    return dto;
                }).collect(Collectors.toList());

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
        
        // Ensure only one active Gamefy pack at a time
        removePackFromUser(userId);

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
        userPack.setRemainingPcHours(calculateHours(pack, Benefit_type.PC));
        userPack.setRemainingVipHours(calculateHours(pack, Benefit_type.VIP));
        userPack.setRemainingCoachingHours(calculateHours(pack, Benefit_type.COACH));
        userPack.setAvailableDiscountIdsList(calculateAllDiscountIds(pack));
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
     * Check and auto-update pack status based on expiration date and remaining benefits.
     */
    @Transactional
    public UserPackGamefy checkAndUpdatePackStatus(UserPackGamefy pack) {
        if (pack.getStatus() == UserPackStatus.ACTIVE) {
            // Check date-based expiration
            if (pack.getExpiresAt() != null && pack.getExpiresAt().isBefore(LocalDateTime.now())) {
                pack.setStatus(UserPackStatus.EXPIRED);
                return userPackGamefyRepository.save(pack);
            }
            // Check consumed: all hours and discounts are 0
            boolean allConsumed =
                    (pack.getRemainingPcHours() == null || pack.getRemainingPcHours() <= 0) &&
                    (pack.getRemainingVipHours() == null || pack.getRemainingVipHours() <= 0) &&
                    (pack.getRemainingCoachingHours() == null || pack.getRemainingCoachingHours() <= 0) &&
                    (pack.getAvailableDiscountIdsList().isEmpty());
            if (allConsumed) {
                pack.setStatus(UserPackStatus.CONSUMED);
                return userPackGamefyRepository.save(pack);
            }
        }
        return pack;
    }

    /**
     * Renew an existing pack for a user: updates the existing UserPackGamefy record
     * in-place with fresh benefits, new dates, and ACTIVE status.
     */
    @Transactional
    @CacheEvict(value = {"users"}, allEntries = true)
    public void renewPackForUser(Integer packId, Integer userId) {
        log.info("Service: Renewing packId {} for userId {}", packId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        PackGamefy pack = repository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + packId));

        // Find existing record for this user (any status)
        Optional<UserPackGamefy> existingOpt = userPackGamefyRepository.findFirstByUserOrderByActivatedAtDesc(user);

        if (existingOpt.isEmpty()) {
            throw new RuntimeException("No existing pack record found for this user to renew");
        }

        UserPackGamefy userPack = existingOpt.get();

        // Update in-place: restore all benefits and dates
        userPack.setPackGamefy(pack);
        userPack.setActivatedAt(LocalDateTime.now());
        userPack.setExpiresAt(LocalDateTime.now().plusMonths(pack.getDurationMonths()));
        userPack.setRemainingPcHours(calculateHours(pack, Benefit_type.PC));
        userPack.setRemainingVipHours(calculateHours(pack, Benefit_type.VIP));
        userPack.setRemainingCoachingHours(calculateHours(pack, Benefit_type.COACH));
        userPack.setAvailableDiscountIdsList(calculateAllDiscountIds(pack));
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);
    }

    /**
     * Count the number of benefits of a given type with rateRule=HOURS.
     * Each such benefit = 1 hour.
     */
    private double calculateHours(PackGamefy pack, Benefit_type type) {
        if (pack.getBenefits() == null) return 0.0;
        return pack.getBenefits().stream()
                .filter(b -> b.getBenefitType() == type && b.getRateRule() == Rate_Rule.HOURS)
                .count();
    }

    /**
     * Get all benefit IDs that are discounts.
     */
    private List<Integer> calculateAllDiscountIds(PackGamefy pack) {
        if (pack.getBenefits() == null) return new java.util.ArrayList<>();
        return pack.getBenefits().stream()
                .filter(b -> b.getRateRule() == Rate_Rule.DISCOUNT)
                .map(GamefyPackBenefit::getId)
                .collect(Collectors.toList());
    }
}
