package com.example.demo.repository;

import com.example.demo.entity.FitnessGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FitnessGoalRepository extends JpaRepository<FitnessGoal, Long> {
    List<FitnessGoal> findByUserId(Long userId);
    Optional<FitnessGoal> findTopByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
}
