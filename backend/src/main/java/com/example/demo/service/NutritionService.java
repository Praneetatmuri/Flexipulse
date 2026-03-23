package com.example.demo.service;

import com.example.demo.entity.DietPlanHistory;
import com.example.demo.repository.DietPlanHistoryRepository;
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

/**
 * NutritionService provides AI-powered diet planning using Google Gemini API.
 * 
 * Security Features:
 * - API key sourced from environment variables (GEMINI_API_KEY)
 * - Never logs or exposes API keys
 * - Validates API key presence before initialization
 * - Handles API errors gracefully
 */
@Service
public class NutritionService {

    private final DietPlanHistoryRepository dietPlanHistoryRepository;
    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String modelName;
    private final boolean apiKeyConfigured;

    /**
     * Initialize NutritionService with Gemini API configuration.
     * The API key is injected from environment variable GEMINI_API_KEY.
     * 
     * @param apiKey The Gemini API key from environment
     * @param modelName The model to use (e.g., "gemini-pro")
     */
    public NutritionService(
            DietPlanHistoryRepository dietPlanHistoryRepository,
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model.name:gemini-pro}") String modelName) {

        this.dietPlanHistoryRepository = dietPlanHistoryRepository;
        this.apiKey = apiKey;
        this.modelName = modelName;
        this.apiKeyConfigured = apiKey != null && !apiKey.isEmpty();
        this.restTemplate = new RestTemplate();
    }

    /**
     * Generate a personalized diet plan based on user health metrics and detailed preferences.
     * 
     * @param userId User ID
     * @param weight User's weight in kg
     * @param height User's height in meters
     * @param workoutCategory Category (e.g., "Weight Loss", "Muscle Gain", "Balanced Fitness")
     * @param dietaryRestrictions Dietary restrictions (e.g., "Vegetarian, Keto")
     * @param allergies Food allergies (e.g., "nuts, shellfish")
     * @param healthConditions Medical conditions (e.g., "Diabetes, Hypertension")
     * @param fitnessGoal Primary fitness goal (e.g., "weight-loss", "muscle-gain")
     * @param mealsPerDay Number of meals per day
     * @param calorieTarget Optional target daily calories
     * @param cuisinePreferences Cuisine preferences (e.g., "Indian, Mediterranean")
     * @param gender User's gender (e.g., "male", "female", "other")
     * @param age User's age in years
     * @return Map containing diet plan, calories, and meal suggestions
     */
    public Map<String, Object> generateDietPlan(
            Long userId,
            double weight,
            double height,
            String workoutCategory,
            String dietaryRestrictions,
            String allergies,
            String healthConditions,
            String fitnessGoal,
            Integer mealsPerDay,
            Integer calorieTarget,
            String cuisinePreferences,
            String gender,
            Integer age) {

        Map<String, Object> response = new HashMap<>();
        
        if (!apiKeyConfigured) {
            String fallback = buildFallbackDietPlan(
                weight, height, workoutCategory, dietaryRestrictions, 
                allergies, healthConditions, fitnessGoal, mealsPerDay, calorieTarget, cuisinePreferences, gender, age
            );
            response.put("success", true);
            response.put("userId", userId);
            response.put("workoutCategory", workoutCategory);
            response.put("dietPlan", fallback);
            response.put("generatedAt", System.currentTimeMillis());
            response.put("source", "fallback-no-api-key");
            response.put("message", "Generated fallback plan. Configure GEMINI_API_KEY later for AI output.");
            saveDietPlanHistory(userId, workoutCategory, fallback, String.valueOf(response.get("source")), (Long) response.get("generatedAt"));
            return response;
        }

        try {
            String prompt = buildDietPlanPrompt(
                weight, height, workoutCategory, dietaryRestrictions, 
                allergies, healthConditions, fitnessGoal, mealsPerDay, calorieTarget, cuisinePreferences, gender, age
            );
            String dietPlan = callGemini(prompt);

            response.put("success", true);
            response.put("userId", userId);
            response.put("workoutCategory", workoutCategory);
            response.put("dietPlan", dietPlan);
            response.put("generatedAt", System.currentTimeMillis());
            response.put("source", "gemini");
            saveDietPlanHistory(userId, workoutCategory, dietPlan, String.valueOf(response.get("source")), (Long) response.get("generatedAt"));

        } catch (RestClientException e) {
            if (shouldUseFallbackForApiError(e)) {
                String fallback = buildFallbackDietPlan(
                    weight, height, workoutCategory, dietaryRestrictions,
                    allergies, healthConditions, fitnessGoal, mealsPerDay, calorieTarget, cuisinePreferences, gender, age
                );
                response.put("success", true);
                response.put("userId", userId);
                response.put("workoutCategory", workoutCategory);
                response.put("dietPlan", fallback);
                response.put("generatedAt", System.currentTimeMillis());
                response.put("source", "fallback-api-quota");
                response.put("message", "Gemini quota/rate limit hit. Returned fallback plan.");
                saveDietPlanHistory(userId, workoutCategory, fallback, String.valueOf(response.get("source")), (Long) response.get("generatedAt"));
                return response;
            }

            response.put("success", false);
            response.put("error", "Gemini API request failed: " + e.getMessage());
            response.put("message", "Failed to generate diet plan. Please try again later.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Unexpected error: " + e.getMessage());
            response.put("message", "An unexpected error occurred while generating the diet plan.");
        }

        return response;
    }

    public List<DietPlanHistory> getRecentDietPlanHistory(Long userId) {
        return dietPlanHistoryRepository.findTop10ByUserIdOrderByGeneratedAtDesc(userId);
    }

    /**
     * Generate personalized meal suggestions for a specific time period.
     * 
     * @param userId User ID
     * @param mealType Type of meal (e.g., "breakfast", "lunch", "dinner")
     * @param calories Target calorie count for the meal
     * @param dietaryPreferences Dietary restrictions
     * @return Map with meal suggestions
     */
    public Map<String, Object> generateMealSuggestions(
            Long userId,
            String mealType,
            int calories,
            String dietaryPreferences) {

        Map<String, Object> response = new HashMap<>();
        
        if (!apiKeyConfigured) {
            response.put("success", true);
            response.put("userId", userId);
            response.put("mealType", mealType);
            response.put("targetCalories", calories);
            response.put("suggestions", buildFallbackMealSuggestions(mealType, calories, dietaryPreferences));
            response.put("generatedAt", System.currentTimeMillis());
            response.put("source", "fallback-no-api-key");
            response.put("message", "Generated fallback meal suggestions. Configure GEMINI_API_KEY later for AI output.");
            return response;
        }

        try {
            String prompt = buildMealPrompt(mealType, calories, dietaryPreferences);
            String mealSuggestions = callGemini(prompt);

            response.put("success", true);
            response.put("userId", userId);
            response.put("mealType", mealType);
            response.put("targetCalories", calories);
            response.put("suggestions", mealSuggestions);
            response.put("generatedAt", System.currentTimeMillis());

        } catch (RestClientException e) {
            if (shouldUseFallbackForApiError(e)) {
                response.put("success", true);
                response.put("userId", userId);
                response.put("mealType", mealType);
                response.put("targetCalories", calories);
                response.put("suggestions", buildFallbackMealSuggestions(mealType, calories, dietaryPreferences));
                response.put("generatedAt", System.currentTimeMillis());
                response.put("source", "fallback-api-quota");
                response.put("message", "Gemini quota/rate limit hit. Returned fallback suggestions.");
                return response;
            }

            response.put("success", false);
            response.put("error", "Gemini API request failed: " + e.getMessage());
            response.put("message", "Failed to generate meal suggestions");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Unexpected error: " + e.getMessage());
        }

        return response;
    }

    /**
     * Check if Gemini API is properly configured.
     * 
     * @return true if API key is available, false otherwise
     */
    public boolean isApiKeyConfigured() {
        return apiKeyConfigured;
    }

    /**
     * Build a prompt for diet plan generation with comprehensive user preferences.
     * Customizes the prompt based on user metrics, health conditions, and preferences.
     */
    private String buildDietPlanPrompt(
            double weight,
            double height,
            String workoutCategory,
            String dietaryRestrictions,
            String allergies,
            String healthConditions,
            String fitnessGoal,
            Integer mealsPerDay,
            Integer calorieTarget,
            String cuisinePreferences,
            String gender,
            Integer age) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a personalized 7-day diet plan for someone with the following detailed profile:\n\n");
        
        // Basic metrics
        prompt.append("HEALTH METRICS:\n");
        prompt.append("- Weight: ").append(weight).append(" kg\n");
        prompt.append("- Height: ").append(height).append(" meters\n");
        if (gender != null && !gender.isEmpty() && !gender.equals("null")) {
            prompt.append("- Gender: ").append(gender).append("\n");
        }
        if (age != null && age > 0) {
            prompt.append("- Age: ").append(age).append(" years\n");
        }
        prompt.append("- Fitness Goal: ").append(fitnessGoal).append("\n");
        prompt.append("- Workout Category: ").append(workoutCategory).append("\n");
        prompt.append("- Number of meals per day: ").append(mealsPerDay).append("\n");
        if (calorieTarget != null && calorieTarget > 0) {
            prompt.append("- Target daily calories: ").append(calorieTarget).append(" kcal\n");
        }
        prompt.append("\n");
        
        // Dietary restrictions
        if (dietaryRestrictions != null && !dietaryRestrictions.isEmpty() && !dietaryRestrictions.equals("null")) {
            prompt.append("DIETARY RESTRICTIONS:\n");
            prompt.append("- ").append(dietaryRestrictions).append("\n\n");
        }
        
        // Allergies
        if (allergies != null && !allergies.isEmpty() && !allergies.equals("null")) {
            prompt.append("ALLERGIES & INTOLERANCES:\n");
            prompt.append("- ").append(allergies).append("\n\n");
        }
        
        // Health conditions
        if (healthConditions != null && !healthConditions.isEmpty() && !healthConditions.equals("null")) {
            prompt.append("HEALTH CONDITIONS TO CONSIDER:\n");
            prompt.append("- ").append(healthConditions).append("\n\n");
        }
        
        // Cuisine preferences
        if (cuisinePreferences != null && !cuisinePreferences.isEmpty() && !cuisinePreferences.equals("null")) {
            prompt.append("PREFERRED CUISINES:\n");
            prompt.append("- ").append(cuisinePreferences).append("\n\n");
        }
        
        prompt.append("REQUIREMENTS:\n");
        prompt.append("1. Ensure all meals respect allergies and dietary restrictions\n");
        prompt.append("2. Account for health conditions in meal planning\n");
        prompt.append("3. Incorporate preferred cuisines where possible\n");
        prompt.append("4. Provide exactly ").append(mealsPerDay).append(" meals per day\n");
        if (calorieTarget != null && calorieTarget > 0) {
            prompt.append("5. Aim for approximately ").append(calorieTarget).append(" calories per day\n");
            prompt.append("6. Provide recommended daily macronutrient breakdown\n");
        } else {
            prompt.append("5. Recommend appropriate daily calorie intake based on goals\n");
            prompt.append("6. Provide recommended daily macronutrient breakdown\n");
        }
        prompt.append("7. Include specific food names and portion sizes\n");
        prompt.append("8. Provide hydration and supplementation advice\n");
        prompt.append("9. Include tips for consistency and adherence\n");
        prompt.append("10. Format as a clear, day-by-day meal plan\n");

        return prompt.toString();
    }

    /**
     * Build a prompt for meal suggestions.
     */
    private String buildMealPrompt(String mealType, int calories, String dietaryPreferences) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Suggest healthy ").append(mealType).append(" options with approximately ");
        prompt.append(calories).append(" calories.\n");
        
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            prompt.append("Dietary restrictions: ").append(dietaryPreferences).append("\n");
        }
        
        prompt.append("Provide:\n");
        prompt.append("1. 3-5 specific meal ideas\n");
        prompt.append("2. Ingredient lists\n");
        prompt.append("3. Estimated nutritional information\n");
        prompt.append("4. Preparation time and difficulty level\n");

        return prompt.toString();
    }

    private String buildFallbackDietPlan(
            double weight, 
            double height, 
            String workoutCategory, 
            String dietaryRestrictions,
            String allergies,
            String healthConditions,
            String fitnessGoal,
            Integer mealsPerDay,
            Integer calorieTarget,
            String cuisinePreferences,
            String gender,
            Integer age) {
        
        double bmi = weight / (height * height);
        int dailyCalories = calorieTarget != null && calorieTarget > 0 ? calorieTarget : 
            ("weight-loss".equalsIgnoreCase(fitnessGoal) || "WEIGHT LOSS".equalsIgnoreCase(workoutCategory)) ? 1800 :
            ("muscle-gain".equalsIgnoreCase(fitnessGoal) || "MUSCLE GAIN".equalsIgnoreCase(workoutCategory)) ? 2600 : 2200;

        StringBuilder fallback = new StringBuilder();
        fallback.append("=== PERSONALIZED 7-DAY DIET PLAN (OFFLINE MODE) ===\n\n");
        
        fallback.append("YOUR PROFILE:\n");
        fallback.append("- BMI: ").append(String.format("%.1f", bmi)).append("\n");
        if (gender != null && !gender.isEmpty() && !gender.equals("null")) {
            fallback.append("- Gender: ").append(gender).append("\n");
        }
        if (age != null && age > 0) {
            fallback.append("- Age: ").append(age).append(" years\n");
        }
        fallback.append("- Fitness Goal: ").append(fitnessGoal).append("\n");
        fallback.append("- Daily Calorie Target: ~").append(dailyCalories).append(" kcal\n");
        fallback.append("- Meals Per Day: ").append(mealsPerDay).append("\n");
        
        if (dietaryRestrictions != null && !dietaryRestrictions.isEmpty() && !dietaryRestrictions.equals("null")) {
            fallback.append("- Dietary Restrictions: ").append(dietaryRestrictions).append("\n");
        }
        if (allergies != null && !allergies.isEmpty() && !allergies.equals("null")) {
            fallback.append("- Allergies: ").append(allergies).append("\n");
        }
        if (healthConditions != null && !healthConditions.isEmpty() && !healthConditions.equals("null")) {
            fallback.append("- Health Conditions: ").append(healthConditions).append("\n");
        }
        if (cuisinePreferences != null && !cuisinePreferences.isEmpty() && !cuisinePreferences.equals("null")) {
            fallback.append("- Preferred Cuisines: ").append(cuisinePreferences).append("\n");
        }
        fallback.append("\n");
        
        fallback.append("MACRONUTRIENT BREAKDOWN (approximate):\n");
        fallback.append("- Protein: 25-30% (").append(String.format("%.0f", dailyCalories * 0.28 / 4)).append("g)\n");
        fallback.append("- Carbs: 45-50% (").append(String.format("%.0f", dailyCalories * 0.48 / 4)).append("g)\n");
        fallback.append("- Fats: 20-25% (").append(String.format("%.0f", dailyCalories * 0.22 / 9)).append("g)\n\n");
        
        fallback.append("DAILY MEAL STRUCTURE:\n");
        if (mealsPerDay >= 3) {
            fallback.append("Breakfast: High-protein meal + fresh fruit + whole grain toast\n");
            fallback.append("Lunch: Lean protein + complex carbs + vegetables + healthy fat\n");
            fallback.append("Dinner: Light protein + large salad + healthy fats\n");
        }
        if (mealsPerDay >= 4) {
            fallback.append("Snack 1: Greek yogurt, nuts, or seasonal fruit\n");
        }
        if (mealsPerDay >= 5) {
            fallback.append("Snack 2: Protein shake or energy balls\n");
        }
        if (mealsPerDay >= 6) {
            fallback.append("Evening Snack: Light vegetable or herbal tea\n");
        }
        
        fallback.append("\nHYDRATION:\n");
        fallback.append("- Drink 2.5 to 3.5 liters of water daily\n");
        fallback.append("- Adjust based on workout intensity\n\n");
        
        fallback.append("KEY TIPS:\n");
        fallback.append("1. Eat protein with every meal for satiety and muscle recovery\n");
        fallback.append("2. Include colorful vegetables in every meal\n");
        fallback.append("3. Avoid processed foods and late-night sugary snacks\n");
        fallback.append("4. Meal prep on Sundays for consistency\n");
        fallback.append("5. Stay consistent and track your progress weekly\n\n");
        
        fallback.append("Note: This is a general offline template. Configure Gemini API for personalized meal recommendations.\n");

        return fallback.toString();
    }

    private String buildFallbackMealSuggestions(String mealType, int calories, String dietaryPreferences) {
        String prefs = (dietaryPreferences == null || dietaryPreferences.isBlank())
            ? "general"
            : dietaryPreferences;

        return "Fallback " + mealType + " suggestions (~" + calories + " kcal, " + prefs + "):\n"
            + "1) Oats bowl + nuts + fruit\n"
            + "2) Paneer/egg/chicken wrap + salad\n"
            + "3) Rice/quinoa + dal/lean protein + veggies\n"
            + "4) Greek yogurt / sprouts bowl\n"
            + "5) Smoothie with protein source and seeds";
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

        if (body == null || !body.containsKey("candidates")) {
            return "No content generated by Gemini.";
        }

        List<Object> candidates = (List<Object>) body.get("candidates");
        if (candidates.isEmpty()) {
            return "No content generated by Gemini.";
        }

        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
        List<Object> responseParts = contentMap == null ? null : (List<Object>) contentMap.get("parts");

        if (responseParts == null || responseParts.isEmpty()) {
            return "No content generated by Gemini.";
        }

        Map<String, Object> firstPart = (Map<String, Object>) responseParts.get(0);
        Object text = firstPart.get("text");
        return text == null ? "No content generated by Gemini." : String.valueOf(text);
    }

    private boolean shouldUseFallbackForApiError(RestClientException e) {
        String message = e.getMessage();
        if (message == null || message.isBlank()) {
            return false;
        }

        String lower = message.toLowerCase();
        return lower.contains("429")
            || lower.contains("quota")
            || lower.contains("rate limit")
            || lower.contains("resource_exhausted");
    }

    private void saveDietPlanHistory(Long userId, String workoutCategory, String dietPlan, String source, Long generatedAt) {
        try {
            DietPlanHistory history = new DietPlanHistory();
            history.setUserId(userId);
            history.setWorkoutCategory(workoutCategory);
            history.setDietPlan(dietPlan);
            history.setSource(source);
            history.setGeneratedAt(generatedAt != null ? generatedAt : System.currentTimeMillis());
            dietPlanHistoryRepository.save(history);
        } catch (Exception ignored) {
            // History persistence should never break main diet generation flow.
        }
    }
}
