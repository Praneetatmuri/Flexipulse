package com.example.demo.controller;

import com.example.demo.entity.FitnessGoal;
import com.example.demo.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping("/save")
    public ResponseEntity<?> saveGoal(@RequestBody FitnessGoal goal) {
        try {
            return ResponseEntity.ok(goalService.saveGoal(goal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<?> getActiveGoal(@PathVariable Long userId) {
        return goalService.getActiveGoal(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<?> getAllGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getAllGoals(userId));
    }

    @PutMapping("/status/{goalId}")
    public ResponseEntity<?> updateGoalStatus(@PathVariable Long goalId, @RequestBody Map<String, String> body) {
        goalService.updateGoalStatus(goalId, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }
}
