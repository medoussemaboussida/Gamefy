package com.gamefy.gamefy_back.model;

import com.gamefy.gamefy_back.model.enums.PC_Type;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fixed_price")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FixedPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "one_hour_price", nullable = false)
    private Float oneHourPrice;

    @Column(name = "two_hours_price", nullable = false)
    private Float twoHoursPrice;

    @Column(name = "three_hours_price", nullable = false)
    private Float threeHoursPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "pc_type", nullable = false)
    private PC_Type pcType;

    @Override
    public String toString() {
        return "FixedPrice{" +
                "id=" + id +
                ", oneHourPrice=" + oneHourPrice +
                ", twoHoursPrice=" + twoHoursPrice +
                ", threeHoursPrice=" + threeHoursPrice +
                ", pcType=" + pcType +
                '}';
    }
}
