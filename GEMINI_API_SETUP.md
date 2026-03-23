# 🔑 Gemini API Setup Guide

This guide will help you set up the Google Gemini API key for the FlexiPulse AI Diet Planning feature.

## Step 1: Create a Google Account

If you don't have a Google account, create one at https://accounts.google.com

## Step 2: Access Google AI Studio

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click on **"Create API Key"** button
4. Select **"Create API key in new project"** or choose an existing project

## Step 3: Copy Your API Key

1. You'll see your API key displayed on the screen
2. Click the **copy icon** to copy it to clipboard
3. **Keep this key secure** - do not share it publicly

## Step 4: Add to Application

### For Development (Local Testing)

Set environment variable instead of hardcoding:

```bash
export GEMINI_API_KEY=your_actual_key_here
```

On Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="your_actual_key_here"
```

Then restart the backend.

### For Production

Use environment variables instead of hardcoding:

```properties
gemini.api.key=${GEMINI_API_KEY}
```

Then set the environment variable:
```bash
export GEMINI_API_KEY=your_actual_key_here
```

Or in Docker:
```dockerfile
ENV GEMINI_API_KEY=your_actual_key_here
```

## Step 5: Test the Integration

1. Start the backend: `mvn spring-boot:run`
2. Start the frontend: `npm run dev`
3. Go to the **Dashboard** and add your health metrics
4. Navigate to **AI Diet Plan**
5. Click **"Generate My 7-Day Diet Plan"**
6. If successful, you'll see a personalized diet plan!

## ⚠️ Security Best Practices

- **Never commit API keys** to version control
- Use `.env` files or environment variables for sensitive data
- Rotate your API key if it's accidentally exposed
- Consider setting API key restrictions in Google Cloud Console

## 🆘 Troubleshooting

### Error: "Authentication failed" or "Invalid API key"
- Verify you copied the entire API key correctly
- Check that there are no extra spaces or characters
- Regenerate the API key and try again

### Error: "API rate limit exceeded"
- The free tier has usage limits
- Wait a moment before trying again
- Consider upgrading to a paid plan for production use

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
- This is expected for browser requests to Google APIs
- The backend handles this using Server-to-Server communication via RestTemplate
- Make sure your backend is running on http://localhost:8080

## 📚 Learn More

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [API Reference Guide](https://ai.google.dev/api)
- [Pricing Information](https://ai.google.dev/pricing)

## 🎯 What You Can Do with Gemini API in FlexiPulse

✅ Generate personalized diet plans based on fitness goals
✅ Create workout recommendations
✅ Provide nutrition advice
✅ Analyze health metrics
✅ Create meal schedules

---

**Your API key is now ready for use in FlexiPulse!**
