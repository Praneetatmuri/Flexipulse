package com.example.demo.controller;

import com.example.demo.service.NutritionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * NutritionController exposes endpoints for AI-powered diet planning.
 * All endpoints interact with the Gemini API through NutritionService.
 * 
 * Security:
 * - API key never exposed in requests or responses
 * - Input validation on all endpoints
 * - CORS restricted to localhost:5173 (frontend)
 */
@RestController
@RequestMapping("/nutrition")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

    /**
     * Generate a personalized diet plan based on user health metrics and preferences.
     * POST /nutrition/diet-plan
     * 
     * Request Body:
     * {
     *   "userId": 1,
     *   "weight": 75.5,
     *   "height": 1.75,
     *   "workoutCategory": "Weight Loss",
     *   "gender": "female",
     *   "age": 28,
     *   "dietaryRestrictions": "Vegetarian, Keto",
     *   "allergies": "nuts, shellfish",
     *   "healthConditions": "Diabetes, Hypertension",
     *   "fitnessGoal": "weight-loss",
     *   "mealsPerDay": 3,
     *   "calorieTarget": 2000,
     *   "cuisinePreferences": "Indian, Mediterranean"
     * }
     */
    @PostMapping("/diet-plan")
    public ResponseEntity<?> generateDietPlan(@RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            if (!request.containsKey("userId") || !request.containsKey("weight") 
                    || !request.containsKey("height") || !request.containsKey("workoutCategory")) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required fields: userId, weight, height, workoutCategory"));
            }

            Long userId = ((Number) request.get("userId")).longValue();
            double weight = ((Number) request.get("weight")).doubleValue();
            double height = ((Number) request.get("height")).doubleValue();
            String workoutCategory = (String) request.get("workoutCategory");
            String dietaryRestrictions = (String) request.getOrDefault("dietaryRestrictions", "");
            String allergies = (String) request.getOrDefault("allergies", "");
            String healthConditions = (String) request.getOrDefault("healthConditions", "");
            String fitnessGoal = (String) request.getOrDefault("fitnessGoal", "maintenance");
            Integer mealsPerDay = request.containsKey("mealsPerDay") 
                ? ((Number) request.get("mealsPerDay")).intValue() : 3;
            Integer calorieTarget = request.containsKey("calorieTarget") && request.get("calorieTarget") != null
                ? ((Number) request.get("calorieTarget")).intValue() : null;
            String cuisinePreferences = (String) request.getOrDefault("cuisinePreferences", "");
            String gender = (String) request.getOrDefault("gender", "");
            Integer age = request.containsKey("age") && request.get("age") != null
                ? ((Number) request.get("age")).intValue() : null;

            // Validate numeric values
            if (weight <= 0 || height <= 0) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Weight and height must be positive values"));
            }

            Map<String, Object> result = nutritionService.generateDietPlan(
                userId,
                weight,
                height,
                workoutCategory,
                dietaryRestrictions,
                allergies,
                healthConditions,
                fitnessGoal,
                mealsPerDay,
                calorieTarget,
                cuisinePreferences,
                gender,
                age
            );

            return ResponseEntity.ok(result);

        } catch (NumberFormatException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid numeric value provided"));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Generate personalized meal suggestions.
     * POST /nutrition/meal-suggestions
     * 
     * Request Body:
     * {
     *   "userId": 1,
     *   "mealType": "breakfast",
     *   "calories": 500,
     *   "dietaryPreferences": "vegan"
     * }
     */
    @PostMapping("/meal-suggestions")
    public ResponseEntity<?> generateMealSuggestions(@RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            if (!request.containsKey("userId") || !request.containsKey("mealType") 
                    || !request.containsKey("calories")) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required fields: userId, mealType, calories"));
            }

            Long userId = ((Number) request.get("userId")).longValue();
            String mealType = (String) request.get("mealType");
            int calories = ((Number) request.get("calories")).intValue();
            String dietaryPreferences = (String) request.getOrDefault("dietaryPreferences", "");

            // Validate calorie value
            if (calories <= 0) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Calories must be a positive value"));
            }

            Map<String, Object> result = nutritionService.generateMealSuggestions(
                userId,
                mealType,
                calories,
                dietaryPreferences
            );

            return ResponseEntity.ok(result);

        } catch (NumberFormatException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid numeric value provided"));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Check if Gemini API is properly configured.
     * GET /nutrition/api-status
     * 
     * Returns:
     * {
     *   "configured": true,
     *   "message": "Gemini API is configured and ready to use"
     * }
     */
    @GetMapping("/api-status")
    public ResponseEntity<?> checkApiStatus() {
        boolean configured = nutritionService.isApiKeyConfigured();
        
        return ResponseEntity.ok(Map.of(
            "configured", configured,
            "message", configured 
                ? "Gemini API is configured and ready to use" 
                : "Gemini API is not configured. Set GEMINI_API_KEY environment variable."
        ));
    }
}
