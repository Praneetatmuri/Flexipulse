# Gemini API Configuration Guide

## Overview
The FlexiPulse backend now includes AI-powered diet planning using Google's Gemini API. This guide explains how to set up and use the new NutritionService and API endpoints.

## Prerequisites
- Java 17+
- Maven 3.6+
- Google Generative AI API key (free tier available at https://makersuite.google.com/app/apikey)

## Step 1: Get Your Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Google will generate your free API key
4. Copy the key (you'll need it for next steps)
5. ⚠️ **IMPORTANT**: Never commit this key to version control

## Step 2: Configure Environment Variable

### On Windows (PowerShell):
```powershell
# Set environment variable for current session
$env:GEMINI_API_KEY = "your-api-key-here"

# Or set permanently (requires admin):
[System.Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-api-key-here", "User")

# Verify it's set:
$env:GEMINI_API_KEY
```

### On Windows (Command Prompt):
```cmd
setx GEMINI_API_KEY "your-api-key-here"
```

### On Linux/Mac:
```bash
export GEMINI_API_KEY="your-api-key-here"

# Or add to ~/.bashrc or ~/.zshrc for persistence:
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

## Step 3: Update Dependencies

The `pom.xml` has been updated to include:
```xml
<dependency>
    <groupId>com.google.ai.client.generativeai</groupId>
    <artifactId>google-generative-ai</artifactId>
    <version>0.7.1</version>
</dependency>
```

When you run the application, Maven will automatically download this dependency.

## Step 4: Configuration Properties

The `application.properties` now includes:
```properties
gemini.api.key=${GEMINI_API_KEY:}
gemini.model.name=gemini-pro
```

- `${GEMINI_API_KEY:}` reads from the GEMINI_API_KEY environment variable
- If not set, it defaults to empty string (API will be disabled with helpful error messages)
- Never hardcode your API key in properties files

## Step 5: API Endpoints

### Generate Diet Plan
```
POST /nutrition/diet-plan
Content-Type: application/json

{
  "userId": 1,
  "weight": 75.5,
  "height": 1.75,
  "workoutCategory": "Weight Loss",
  "dietaryPreferences": "vegetarian"
}

Response:
{
  "success": true,
  "userId": 1,
  "workoutCategory": "Weight Loss",
  "dietPlan": "[AI-generated diet plan details]",
  "generatedAt": 1700000000000
}
```

### Generate Meal Suggestions
```
POST /nutrition/meal-suggestions
Content-Type: application/json

{
  "userId": 1,
  "mealType": "breakfast",
  "calories": 500,
  "dietaryPreferences": "vegan"
}

Response:
{
  "success": true,
  "userId": 1,
  "mealType": "breakfast",
  "targetCalories": 500,
  "suggestions": "[AI-generated meal suggestions]",
  "generatedAt": 1700000000000
}
```

### Check API Status
```
GET /nutrition/api-status

Response:
{
  "configured": true,
  "message": "Gemini API is configured and ready to use"
}
```

## Step 6: Run the Application

### In Spring Tool Suite (STS):
1. Right-click project → Run As → Spring Boot App
2. Application starts on http://localhost:8080

### Via Maven Command Line:
```bash
mvn spring-boot:run
```

### After Starting:
1. Check Gemini API status: `http://localhost:8080/nutrition/api-status`
2. View H2 Console: `http://localhost:8080/h2-console`
3. Test endpoints using Postman, curl, or the frontend

## Security Best Practices

✅ **DO:**
- Store API key in environment variables
- Use different keys for development and production
- Rotate keys periodically
- Use separate application-prod.properties for production

❌ **DON'T:**
- Commit API keys to Git
- Hardcode keys in source code
- Share keys via email or chat
- Use the same key across environments
- Log or print API keys

## Frontend Integration

The frontend can now call these endpoints:

```javascript
// Generate diet plan
const response = await fetch('http://localhost:8080/nutrition/diet-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    weight: 75.5,
    height: 1.75,
    workoutCategory: 'Weight Loss',
    dietaryPreferences: 'vegetarian'
  })
});

const dietPlan = await response.json();
console.log(dietPlan);
```

## Troubleshooting

### API Key Not Recognized
```
Error: Gemini API key not configured
```
**Solution**: Ensure GEMINI_API_KEY environment variable is set:
```bash
echo $GEMINI_API_KEY  # Linux/Mac
echo %GEMINI_API_KEY% # Windows CMD
```

### Dependency Not Found During Build
```
[ERROR] Could not find artifact com.google.ai.client.generativeai:google-generative-ai:jar:0.7.1
```
**Solution**: Update Maven:
```bash
mvn clean install -U
```

### Connection Timeout to Gemini API
```
java.net.SocketTimeoutException: connect timed out
```
**Solution**: 
- Check internet connection
- Verify API key is valid
- Check if Gemini API endpoint is accessible: https://generativelanguage.googleapis.com

## Files Modified/Created

### Modified:
- `pom.xml` - Added Google Generative AI dependency
- `src/main/resources/application.properties` - Added Gemini configuration

### Created:
- `src/main/java/com/example/demo/service/NutritionService.java` - Service for Gemini API
- `src/main/java/com/example/demo/controller/NutritionController.java` - REST endpoints
- `src/main/resources/application-prod.properties` - Production configuration

## Next Steps

1. ✅ Set GEMINI_API_KEY environment variable
2. ✅ Rebuild Maven project to download dependencies
3. ✅ Start the backend
4. ✅ Test `/nutrition/api-status` endpoint
5. ✅ Integrate frontend API calls
6. ✅ Test full diet plan generation workflow

## References

- [Google Generative AI SDK](https://github.com/google/generative-ai-java)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Spring Boot Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
