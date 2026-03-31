package com.example.demo.repository;

import com.example.demo.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WorkoutPlan> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
