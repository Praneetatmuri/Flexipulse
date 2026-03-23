package com.example.demo.service;

import com.example.demo.entity.HealthMetric;
import com.example.demo.repository.HealthMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class HealthService {

    @Autowired
    private HealthMetricRepository healthMetricRepository;

    // BMI Formula: weight / (height * height)
    public double calculateBmi(double weight, double height) {
        return Math.round((weight / (height * height)) * 10.0) / 10.0;
    }

    // Assign category based on BMI value
    public String assignWorkoutCategory(double bmi) {
        if (bmi < 18.5) {
            return "Muscle Gain";
        } else if (bmi < 25.0) {
            return "Balanced Fitness";
        } else {
            return "Weight Loss";
        }
    }

    // Save metric to H2 database
    public HealthMetric saveMetric(HealthMetric metric) {
        double bmi = calculateBmi(metric.getWeight(), metric.getHeight());
        metric.setBmi(bmi);
        metric.setWorkoutCategory(assignWorkoutCategory(bmi));
        return healthMetricRepository.save(metric);
    }

    // Calculate only — no save
    public Map<String, Object> calculateOnly(double weight, double height) {
        double bmi = calculateBmi(weight, height);
        return Map.of("bmi", bmi, "workoutCategory", assignWorkoutCategory(bmi));
    }

    public List<HealthMetric> getAllMetrics() {
        return healthMetricRepository.findAll();
    }

    public List<HealthMetric> getMetricsByUser(Long userId) {
        return healthMetricRepository.findByUserId(userId);
    }
}
