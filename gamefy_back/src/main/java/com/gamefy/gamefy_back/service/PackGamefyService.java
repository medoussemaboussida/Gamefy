package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.dto.CreatePackGamefyDto;
import com.gamefy.gamefy_back.dto.PackGamefyDto;
import com.gamefy.gamefy_back.model.GamefyPackBenefit;
import com.gamefy.gamefy_back.model.PackGamefy;
import com.gamefy.gamefy_back.model.Payment;
import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.repository.PackGamefyRepository;
import com.gamefy.gamefy_back.repository.PaymentRepository;
import com.gamefy.gamefy_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackGamefyService {

    private final PackGamefyRepository repository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

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

        // Unassign pack from all users
        for (User user : pack.getUsers()) {
            user.setPackGamefy(null);
            userRepository.save(user);
        }

        // Clear the users list to prevent JPA from trying to maintain the relationship
        pack.getUsers().clear();

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
                .benefits(benefitsDto)
                .build();
    }

    @Transactional
    public void assignPackToUser(Integer packId, Integer userId) {
        log.info("Service: Assigning packId {} to userId {}", packId, userId);
        PackGamefy pack = repository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + packId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setPackGamefy(pack);
        userRepository.save(user);

        // Add to payment history
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackGamefy(pack);
        payment.setTotalPrice(pack.getPrice());
        paymentRepository.save(payment);
    }

    @Transactional
    public void removePackFromUser(Integer userId) {
        log.info("Service: Removing pack from userId {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        PackGamefy currentPack = user.getPackGamefy();
        if (currentPack != null) {
            // Remove from payment history
            paymentRepository.findByUserAndPackGamefy(user, currentPack)
                    .ifPresent(paymentRepository::delete);
        }

        user.setPackGamefy(null);
        userRepository.save(user);
    }
}
