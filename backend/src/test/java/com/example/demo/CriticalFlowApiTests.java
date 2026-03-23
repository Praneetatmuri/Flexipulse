package com.example.demo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
class CriticalFlowApiTests {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${local.server.port}")
    private int port;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private HttpRequest jsonPost(String path, String body) {
        return HttpRequest.newBuilder(URI.create(baseUrl() + path))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
    }

    private HttpRequest jsonPostWithToken(String path, String body, String token) {
        return HttpRequest.newBuilder(URI.create(baseUrl() + path))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
    }

    @Test
    void registerAndLoginShouldReturnJwtToken() throws Exception {
        String uniqueEmail = "member" + System.currentTimeMillis() + "@test.com";

        String registerPayload = """
            {
              "name": "Test Member",
              "email": "%s",
              "password": "Password123",
              "role": "MEMBER"
            }
            """.formatted(uniqueEmail);

        HttpResponse<String> registerResponse = httpClient.send(
            jsonPost("/users/register", registerPayload),
            HttpResponse.BodyHandlers.ofString()
        );
        assertTrue(registerResponse.statusCode() >= 200 && registerResponse.statusCode() < 300);

        String loginPayload = """
            {
              "email": "%s",
              "password": "Password123"
            }
            """.formatted(uniqueEmail);

        HttpResponse<String> loginResponse = httpClient.send(
            jsonPost("/users/login", loginPayload),
            HttpResponse.BodyHandlers.ofString()
        );

        assertTrue(loginResponse.statusCode() >= 200 && loginResponse.statusCode() < 300);
        JsonNode loginJson = objectMapper.readTree(loginResponse.body());
        assertNotNull(loginJson.get("token"));
        assertTrue(!loginJson.get("token").asText().isBlank());
    }

    @Test
    void bookingEndpointShouldRequireAuthentication() throws Exception {
        String payload = """
            {
              "trainerName": "Alex",
              "userEmail": "member@test.com",
              "slotTime": "10:00 AM",
              "date": "2026-03-24"
            }
            """;

        HttpResponse<String> response = httpClient.send(
            jsonPost("/appointments/book", payload),
            HttpResponse.BodyHandlers.ofString()
        );

        assertTrue(response.statusCode() >= 400 && response.statusCode() < 500);
    }

    @Test
    void dietEndpointShouldRequireAuthentication() throws Exception {
        String payload = """
            {
              "userId": 1,
              "weight": 75,
              "height": 1.80,
              "workoutCategory": "Balanced Fitness"
            }
            """;

        HttpResponse<String> response = httpClient.send(
            jsonPost("/nutrition/diet-plan", payload),
            HttpResponse.BodyHandlers.ofString()
        );

        assertTrue(response.statusCode() >= 400 && response.statusCode() < 500);
    }

    @Test
    void dietEndpointShouldWorkWithValidToken() throws Exception {
        String uniqueEmail = "diet" + System.currentTimeMillis() + "@test.com";

        String registerPayload = """
            {
              "name": "Diet User",
              "email": "%s",
              "password": "Password123",
              "role": "MEMBER"
            }
            """.formatted(uniqueEmail);

        HttpResponse<String> registerResponse = httpClient.send(
            jsonPost("/users/register", registerPayload),
            HttpResponse.BodyHandlers.ofString()
        );
        assertTrue(registerResponse.statusCode() >= 200 && registerResponse.statusCode() < 300);

        String loginPayload = """
            {
              "email": "%s",
              "password": "Password123"
            }
            """.formatted(uniqueEmail);

        HttpResponse<String> loginResponse = httpClient.send(
            jsonPost("/users/login", loginPayload),
            HttpResponse.BodyHandlers.ofString()
        );
        assertTrue(loginResponse.statusCode() >= 200 && loginResponse.statusCode() < 300);

        JsonNode loginJson = objectMapper.readTree(loginResponse.body());
        JsonNode userNode = loginJson.get("user");
        long userId = userNode.get("id").asLong();
        String token = loginJson.get("token").asText();

        String dietPayload = """
            {
              "userId": %d,
              "weight": 72,
              "height": 1.75,
              "workoutCategory": "Balanced Fitness",
              "fitnessGoal": "maintenance",
              "mealsPerDay": 3
            }
            """.formatted(userId);

        HttpResponse<String> dietResponse = httpClient.send(
            jsonPostWithToken("/nutrition/diet-plan", dietPayload, token),
            HttpResponse.BodyHandlers.ofString()
        );

        assertTrue(dietResponse.statusCode() == 200);
        JsonNode dietJson = objectMapper.readTree(dietResponse.body());
        assertNotNull(dietJson.get("success"));
    }
}
