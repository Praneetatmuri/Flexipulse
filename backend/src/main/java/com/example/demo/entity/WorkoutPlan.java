package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "workout_plans")
public class WorkoutPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String goalType; // e.g., Strength, Hypertrophy, Weight Loss
    
    @Column(columnDefinition = "TEXT")
    private String planText;

    private String source = "gemini";
    private Long createdAt = System.currentTimeMillis();
}
