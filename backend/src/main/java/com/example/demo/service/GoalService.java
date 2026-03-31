package com.example.demo.service;

import com.example.demo.entity.FitnessGoal;
import com.example.demo.repository.FitnessGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    @Autowired
    private FitnessGoalRepository fitnessGoalRepository;

    public FitnessGoal saveGoal(FitnessGoal goal) {
        // If there's an existing active goal, we could deactivate it or just let the new one take over.
        // For simplicity, we'll just save the new one.
        return fitnessGoalRepository.save(goal);
    }

    public Optional<FitnessGoal> getActiveGoal(Long userId) {
        return fitnessGoalRepository.findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, "ACTIVE");
    }

    public List<FitnessGoal> getAllGoals(Long userId) {
        return fitnessGoalRepository.findByUserId(userId);
    }

    public void updateGoalStatus(Long goalId, String status) {
        fitnessGoalRepository.findById(goalId).ifPresent(goal -> {
            goal.setStatus(status);
            fitnessGoalRepository.save(goal);
        });
    }
}
