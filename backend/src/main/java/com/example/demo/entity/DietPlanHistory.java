package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "diet_plan_history")
public class DietPlanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String workoutCategory;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String dietPlan;

    private Long generatedAt;

    private String source;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getWorkoutCategory() { return workoutCategory; }
    public void setWorkoutCategory(String workoutCategory) { this.workoutCategory = workoutCategory; }

    public String getDietPlan() { return dietPlan; }
    public void setDietPlan(String dietPlan) { this.dietPlan = dietPlan; }

    public Long getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Long generatedAt) { this.generatedAt = generatedAt; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
