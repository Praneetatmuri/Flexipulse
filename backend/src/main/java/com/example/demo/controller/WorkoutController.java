package com.example.demo.controller;

import com.example.demo.service.WorkoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, Object> body) {
        Long userId = ((Number) body.get("userId")).longValue();
        String goal = (String) body.getOrDefault("goalType", "Strength");
        int days = ((Number) body.getOrDefault("daysPerWeek", 3)).intValue();
        String equip = (String) body.getOrDefault("equipment", "Gym");
        String level = (String) body.getOrDefault("fitnessLevel", "Beginner");

        return ResponseEntity.ok(workoutService.generateWorkoutPlan(userId, goal, days, equip, level));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(workoutService.getRecentHistory(userId));
    }
}
