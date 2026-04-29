package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreatePackGamefyDto;
import com.gamefy.gamefy_back.dto.PlayerPackGamefyDetailsDto;
import com.gamefy.gamefy_back.dto.PackGamefyDto;
import com.gamefy.gamefy_back.dto.UserPackResponseDto;
import com.gamefy.gamefy_back.model.GamefyPackBenefit;
import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.UserPackGamefy;
import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.DiscountType;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import com.gamefy.gamefy_back.repository.GamefyPackBenefitRepository;
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
    private final NotificationPackService notificationPackService;
    private final GamefyPackBenefitRepository gamefyPackBenefitRepository;

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
                        if (b.getBenefitType() != null && !b.getBenefitType().isEmpty()) {
                            benefit.setBenefitType(Benefit_type.valueOf(b.getBenefitType()));
                        }
                        benefit.setRateRule(Rate_Rule.valueOf(b.getRateRule()));
                        if (b.getDiscountType() != null) {
                            benefit.setDiscountType(DiscountType.valueOf(b.getDiscountType()));
                        }
                        benefit.setDiscountValue(b.getDiscountValue());
                        benefit.setItemName(b.getItemName());
                        benefit.setItemQuantity(b.getItemQuantity());
                        benefit.setHours(b.getHours());
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
                        if (b.getBenefitType() != null && !b.getBenefitType().isEmpty()) {
                            benefit.setBenefitType(Benefit_type.valueOf(b.getBenefitType()));
                        }
                        benefit.setRateRule(Rate_Rule.valueOf(b.getRateRule()));
                        if (b.getDiscountType() != null) {
                            benefit.setDiscountType(DiscountType.valueOf(b.getDiscountType()));
                        }
                        benefit.setDiscountValue(b.getDiscountValue());
                        benefit.setItemName(b.getItemName());
                        benefit.setItemQuantity(b.getItemQuantity());
                        benefit.setHours(b.getHours());
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

    public List<UserPackResponseDto> getPlayersByPackId(Integer packId) {
        PackGamefy pack = repository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + packId));

        // Get FREE_ITEM benefit IDs for this pack
        List<GamefyPackBenefit> itemBenefits = pack.getBenefits().stream()
                .filter(b -> b.getRateRule() == Rate_Rule.FREE_ITEM)
                .collect(Collectors.toList());

        return userPackGamefyRepository.findByPackGamefy(pack).stream()
                .map(up -> {
                    java.util.Map<Integer, Integer> consumedMap = up.getConsumedItemQuantitiesMap();
                    List<UserPackResponseDto.ItemBenefitStatus> items = itemBenefits.stream()
                            .map(b -> UserPackResponseDto.ItemBenefitStatus.builder()
                                     .benefitId(b.getId())
                                     .itemName(b.getItemName())
                                     .itemQuantity(b.getItemQuantity() != null ? b.getItemQuantity() : 1)
                                     .consumedQuantity(consumedMap.getOrDefault(b.getId(), 0))
                                     .build())
                            .collect(Collectors.toList());
                    return UserPackResponseDto.builder()
                            .firstName(up.getUser().getFirstName())
                            .lastName(up.getUser().getLastName())
                            .email(up.getUser().getEmail())
                            .status(up.getStatus())
                            .userId(up.getUser().getId())
                            .userPackId(up.getId())
                            .itemBenefits(items)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public PlayerPackGamefyDetailsDto getMyPackDetails(User player) {
        UserPackGamefy up = userPackGamefyRepository.findFirstByUserOrderByActivatedAtDesc(player)
                .orElseThrow(() -> new RuntimeException("No active Gamefy pack found for this user"));

        PackGamefy pack = up.getPackGamefy();
        List<GamefyPackBenefit> allBenefits = pack.getBenefits();

        List<PlayerPackGamefyDetailsDto.DiscountBenefitDto> discounts = allBenefits.stream()
                .filter(b -> b.getRateRule() == Rate_Rule.DISCOUNT)
                .map(b -> PlayerPackGamefyDetailsDto.DiscountBenefitDto.builder()
                        .benefitId(b.getId())
                        .rateRule(b.getRateRule())
                        .benefitType(b.getBenefitType())
                        .discountType(b.getDiscountType())
                        .discountValue(b.getDiscountValue())
                        .isAvailable(up.getAvailableDiscountIdsList().contains(b.getId()))
                        .build())
                .collect(Collectors.toList());

        java.util.Map<Integer, Integer> consumedMap = up.getConsumedItemQuantitiesMap();
        List<PlayerPackGamefyDetailsDto.ItemBenefitDto> items = allBenefits.stream()
                .filter(b -> b.getRateRule() == Rate_Rule.FREE_ITEM)
                .map(b -> {
                    int total = b.getItemQuantity() != null ? b.getItemQuantity() : 1;
                    int consumed = consumedMap.getOrDefault(b.getId(), 0);
                    return PlayerPackGamefyDetailsDto.ItemBenefitDto.builder()
                            .benefitId(b.getId())
                            .itemName(b.getItemName())
                            .totalQuantity(total)
                            .consumedQuantity(consumed)
                            .remainingQuantity(Math.max(0, total - consumed))
                            .build();
                })
                .collect(Collectors.toList());

        return PlayerPackGamefyDetailsDto.builder()
                .packName(pack.getName())
                .packPrice(pack.getPrice())
                .durationMonths(pack.getDurationMonths())
                .activatedAt(up.getActivatedAt())
                .expiresAt(up.getExpiresAt())
                .status(up.getStatus())
                .remainingPcHours(up.getRemainingPcHours())
                .totalPcHours(calculateHours(pack, Benefit_type.PC))
                .remainingVipHours(up.getRemainingVipHours())
                .totalVipHours(calculateHours(pack, Benefit_type.VIP))
                .remainingCoachingHours(up.getRemainingCoachingHours())
                .totalCoachingHours(calculateHours(pack, Benefit_type.COACH))
                .discountBenefits(discounts)
                .itemBenefits(items)
                .build();
    }

    private PackGamefyDto mapToDto(PackGamefy pack) {
        List<PackGamefyDto.PackBenefitDto> benefitsDto = pack.getBenefits().stream()
                .map(b -> {
                    PackGamefyDto.PackBenefitDto dto = new PackGamefyDto.PackBenefitDto();
                    dto.setId(b.getId());
                    dto.setBenefitType(b.getBenefitType() != null ? b.getBenefitType().name() : null);
                    dto.setRateRule(b.getRateRule().name());
                    dto.setDiscountType(b.getDiscountType() != null ? b.getDiscountType().name() : null);
                    dto.setDiscountValue(b.getDiscountValue());
                    dto.setItemName(b.getItemName());
                    dto.setItemQuantity(b.getItemQuantity());
                    dto.setHours(b.getHours());
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
        
        // Ensure only one active Gamefy pack at a time (silent — no notification for internal removal)
        removePackFromUserSilent(userId);

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
        userPack.setConsumedItemQuantitiesMap(new java.util.LinkedHashMap<>());
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);

        // Notify the player
        notificationPackService.sendPackNotification(user, pack.getName(), "PACK_GAMEFY_ASSIGNED", userPack.getId());
    }

    @Transactional
    @CacheEvict(value = {"users", "payments"}, allEntries = true)
    public void removePackFromUser(Integer userId) {
        log.info("Service: Removing pack from userId {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Find and delete active junction records for this user
        List<UserPackGamefy> activeRecords = userPackGamefyRepository.findByUserAndStatus(user, UserPackStatus.ACTIVE);

        // Notify the player for each removed pack
        for (UserPackGamefy record : activeRecords) {
            notificationPackService.sendPackNotification(user, record.getPackGamefy().getName(), "PACK_GAMEFY_REMOVED", record.getId());
        }

        userPackGamefyRepository.deleteAll(activeRecords);
    }

    /** Silent removal — used internally during reassignment to avoid double notifications */
    @Transactional
    @CacheEvict(value = {"users", "payments"}, allEntries = true)
    private void removePackFromUserSilent(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
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
            // Check all item benefits fully consumed (consumed qty >= total qty for each)
            List<GamefyPackBenefit> itemBenefits = pack.getPackGamefy().getBenefits() == null
                    ? java.util.Collections.emptyList()
                    : pack.getPackGamefy().getBenefits().stream()
                        .filter(b -> b.getRateRule() == Rate_Rule.FREE_ITEM)
                        .collect(Collectors.toList());
            java.util.Map<Integer, Integer> consumedMap = pack.getConsumedItemQuantitiesMap();
            boolean allItemsConsumed = itemBenefits.stream().allMatch(b -> {
                int totalQty = b.getItemQuantity() != null ? b.getItemQuantity() : 1;
                int consumedQty = consumedMap.getOrDefault(b.getId(), 0);
                return consumedQty >= totalQty;
            });

            // Check consumed: all hours, discounts, AND items are done
            boolean allConsumed =
                    (pack.getRemainingPcHours() == null || pack.getRemainingPcHours() <= 0) &&
                    (pack.getRemainingVipHours() == null || pack.getRemainingVipHours() <= 0) &&
                    (pack.getRemainingCoachingHours() == null || pack.getRemainingCoachingHours() <= 0) &&
                    (pack.getAvailableDiscountIdsList().isEmpty()) &&
                    allItemsConsumed;
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
        userPack.setConsumedItemQuantitiesMap(new java.util.LinkedHashMap<>());
        userPack.setStatus(UserPackStatus.ACTIVE);
        userPackGamefyRepository.save(userPack);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);

        // Notify the player
        notificationPackService.sendPackNotification(user, pack.getName(), "PACK_GAMEFY_RENEWED", userPack.getId());
    }

    /**
     * Sum the hours for benefits of a given type with rateRule=HOURS.
     * Each benefit's hours field specifies the count (null defaults to 1.0 for backward compatibility).
     */
    private double calculateHours(PackGamefy pack, Benefit_type type) {
        if (pack.getBenefits() == null) return 0.0;
        return pack.getBenefits().stream()
                .filter(b -> b.getBenefitType() == type && b.getRateRule() == Rate_Rule.HOURS)
                .mapToDouble(b -> b.getHours() != null ? b.getHours() : 1.0)
                .sum();
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

    /**
     * Consume one unit of a FREE_ITEM benefit for a specific user pack.
     * Called by admin/webmaster from the back office.
     */
    @Transactional
    public void consumeItemBenefit(Integer userPackId, Integer benefitId) {
        UserPackGamefy userPack = userPackGamefyRepository.findById(userPackId)
                .orElseThrow(() -> new RuntimeException("UserPackGamefy not found with id: " + userPackId));

        // Verify the benefit exists and is FREE_ITEM
        GamefyPackBenefit benefit = gamefyPackBenefitRepository.findById(benefitId)
                .orElseThrow(() -> new RuntimeException("Benefit not found with id: " + benefitId));
        if (benefit.getRateRule() != Rate_Rule.FREE_ITEM) {
            throw new RuntimeException("Benefit " + benefitId + " is not a FREE_ITEM benefit");
        }

        int maxQty = benefit.getItemQuantity() != null ? benefit.getItemQuantity() : 1;
        java.util.Map<Integer, Integer> consumedMap = userPack.getConsumedItemQuantitiesMap();
        int currentConsumed = consumedMap.getOrDefault(benefitId, 0);

        if (currentConsumed < maxQty) {
            consumedMap.put(benefitId, currentConsumed + 1);
            userPack.setConsumedItemQuantitiesMap(consumedMap);
            userPackGamefyRepository.save(userPack);
            // Check if pack is now fully consumed
            checkAndUpdatePackStatus(userPack);
        }
    }

    /**
     * Un-consume one unit of a FREE_ITEM benefit (undo).
     */
    @Transactional
    public void unconsumeItemBenefit(Integer userPackId, Integer benefitId) {
        UserPackGamefy userPack = userPackGamefyRepository.findById(userPackId)
                .orElseThrow(() -> new RuntimeException("UserPackGamefy not found with id: " + userPackId));

        java.util.Map<Integer, Integer> consumedMap = userPack.getConsumedItemQuantitiesMap();
        int currentConsumed = consumedMap.getOrDefault(benefitId, 0);

        if (currentConsumed > 0) {
            consumedMap.put(benefitId, currentConsumed - 1);
            if (consumedMap.get(benefitId) == 0) {
                consumedMap.remove(benefitId);
            }
            userPack.setConsumedItemQuantitiesMap(consumedMap);
            // If pack was CONSUMED, revert to ACTIVE since item was un-consumed
            if (userPack.getStatus() == UserPackStatus.CONSUMED) {
                userPack.setStatus(UserPackStatus.ACTIVE);
            }
            userPackGamefyRepository.save(userPack);
        }
    }
}
