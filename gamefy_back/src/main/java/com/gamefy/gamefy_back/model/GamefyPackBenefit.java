package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.Benefit_type;
import com.gamefy.gamefy_back.model.enums.DiscountType;
import com.gamefy.gamefy_back.model.enums.Rate_Rule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gamefy_pack_benefit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GamefyPackBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "gamefy_pack_id", nullable = false)
    private PackGamefy packGamefy;

    @Enumerated(EnumType.STRING)
    @Column(name = "benefit_type")
    private Benefit_type benefitType;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_rule", nullable = false)
    private Rate_Rule rateRule;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type")
    private DiscountType discountType;

    @Column(name = "discount_value")
    private Double discountValue;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "item_quantity")
    private Integer itemQuantity;

    @Column(name = "hours")
    private Double hours;

    @Override
    public String toString() {
        return "GamefyPackBenefit{" +
                "id=" + id +
                ", benefitType=" + benefitType +
                ", rateRule=" + rateRule +
                ", discountType=" + discountType +
                ", discountValue=" + discountValue +
                ", itemName='" + itemName + '\'' +
                ", itemQuantity=" + itemQuantity +
                ", hours=" + hours +
                '}';
    }
}
