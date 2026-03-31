package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "fitness_goals")
public class FitnessGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Double targetWeight;
    private Double startWeight;
    private Double currentWeight;
    private LocalDate deadline;
    
    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, ACHIEVED, CANCELLED

    private Long createdAt = System.currentTimeMillis();
}
