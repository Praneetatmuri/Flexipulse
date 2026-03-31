package com.example.demo.service;

import com.example.demo.entity.WorkoutPlan;
import com.example.demo.repository.WorkoutPlanRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkoutService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String modelName;
    private final boolean apiKeyConfigured;

    public WorkoutService(
            WorkoutPlanRepository workoutPlanRepository,
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model.name:gemini-pro}") String modelName) {

        this.workoutPlanRepository = workoutPlanRepository;
        this.apiKey = apiKey;
        this.modelName = modelName;
        this.apiKeyConfigured = apiKey != null && !apiKey.isEmpty();
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> generateWorkoutPlan(
            Long userId,
            String goalType,
            Integer daysPerWeek,
            String equipment,
            String fitnessLevel) {

        Map<String, Object> response = new HashMap<>();
        
        if (!apiKeyConfigured) {
            String fallback = buildFallbackPlan(goalType, daysPerWeek, equipment, fitnessLevel);
            response.put("success", true);
            response.put("planText", fallback);
            response.put("source", "fallback");
            savePlan(userId, goalType, fallback);
            return response;
        }

        try {
            String prompt = buildWorkoutPrompt(goalType, daysPerWeek, equipment, fitnessLevel);
            String planText = callGemini(prompt);

            response.put("success", true);
            response.put("planText", planText);
            response.put("source", "gemini");
            savePlan(userId, goalType, planText);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    public List<WorkoutPlan> getRecentHistory(Long userId) {
        return workoutPlanRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }

    private String buildWorkoutPrompt(String goal, int days, String equip, String level) {
        return String.format(
            "Create a professional %d-day workout split for a %s level athlete. " +
            "Goal: %s. Equipment available: %s. " +
            "Include specific exercises, sets, reps, and rest times. " +
            "Format as a clear, daily schedule.",
            days, level, goal, equip
        );
    }

    private String buildFallbackPlan(String goal, int days, String equip, String level) {
        return "=== Personalized Workout Plan (Offline Mode) ===\n\n" +
               "Goal: " + goal + "\n" +
               "Level: " + level + "\n" +
               "Note: Configure GEMINI_API_KEY for a real AI generation.\n" +
               "Daily: Pushups (3x15), Squats (3x20), Lunges (3x12), Planks (3x45s).";
    }

    private void savePlan(Long userId, String goal, String text) {
        WorkoutPlan plan = new WorkoutPlan();
        plan.setUserId(userId);
        plan.setGoalType(goal);
        plan.setPlanText(text);
        workoutPlanRepository.save(plan);
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
            + modelName + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(textPart);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(content);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contents);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);
        Map<String, Object> body = responseEntity.getBody();

        if (body == null || !body.containsKey("candidates")) return "No content.";
        List<Object> candidates = (List<Object>) body.get("candidates");
        if (candidates.isEmpty()) return "No content.";
        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
        List<Object> respParts = (List<Object>) contentMap.get("parts");
        Map<String, Object> firstPart = (Map<String, Object>) respParts.get(0);
        return String.valueOf(firstPart.get("text"));
    }
}
