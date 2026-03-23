package com.example.demo.repository;

import com.example.demo.entity.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {

    List<HealthMetric> findByUserId(Long userId);
}
