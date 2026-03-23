package com.example.demo.repository;

import com.example.demo.entity.DietPlanHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DietPlanHistoryRepository extends JpaRepository<DietPlanHistory, Long> {
    List<DietPlanHistory> findTop10ByUserIdOrderByGeneratedAtDesc(Long userId);
}
