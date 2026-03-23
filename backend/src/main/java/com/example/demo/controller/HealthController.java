package com.example.demo.controller;

import com.example.demo.entity.HealthMetric;
import com.example.demo.service.HealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "http://localhost:5173")
public class HealthController {

    @Autowired
    private HealthService healthService;

    @PostMapping("/save")
    public ResponseEntity<?> saveMetric(@RequestBody HealthMetric metric) {
        try {
            return ResponseEntity.ok(healthService.saveMetric(metric));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculate(@RequestBody Map<String, Double> body) {
        double weight = body.get("weight");
        double height = body.get("height");
        return ResponseEntity.ok(healthService.calculateOnly(weight, height));
    }

    @GetMapping("/all")
    public ResponseEntity<List<HealthMetric>> getAll() {
        return ResponseEntity.ok(healthService.getAllMetrics());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<HealthMetric>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(healthService.getMetricsByUser(userId));
    }
}
