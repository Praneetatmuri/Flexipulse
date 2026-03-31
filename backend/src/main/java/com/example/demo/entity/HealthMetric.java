package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "health_metrics")
public class HealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private double weight;
    private double height;
    private double bmi;
    private String workoutCategory;

    public HealthMetric() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getBmi() { return bmi; }
    public void setBmi(double bmi) { this.bmi = bmi; }

    public String getWorkoutCategory() { return workoutCategory; }
    public void setWorkoutCategory(String workoutCategory) {
        this.workoutCategory = workoutCategory;
    }
}
