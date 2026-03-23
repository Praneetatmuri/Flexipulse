# ⚡ Quick Start Guide - FlexiPulse

Get FlexiPulse up and running in 5 minutes!

## 🎯 Prerequisites Check
- ✅ Java 17+ installed? (`java -version`)
- ✅ Maven installed? (`mvn -version`)
- ✅ Node.js 18+ installed? (`node -v`)
- ✅ Google Gemini API key? (Get one at https://aistudio.google.com)

---

## 🚀 Step 1: Configure API Key

Set your API key as an environment variable (recommended):

```powershell
$env:GEMINI_API_KEY="your_actual_key_here"
```

Or (Linux/macOS):

```bash
export GEMINI_API_KEY=your_actual_key_here
```

---

## 🚀 Step 2: Start Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Build and run
mvn clean install
mvn spring-boot:run
```

**✅ Backend ready when you see:**
```
Started FlexipulseApplication in X.XXX seconds
```

**🌐 Backend URL:** http://localhost:8080

---

## 🚀 Step 3: Start Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**✅ Frontend ready when you see:**
```
  VITE v8.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

**🌐 Frontend URL:** http://localhost:5173

---

## 🎮 Step 4: Test the Application

### 1️⃣ Dashboard - Add Health Metrics
```
1. Visit: http://localhost:5173
2. You're on the Dashboard
3. Enter:
   - Height: 1.75 (meters)
   - Weight: 70 (kilograms)
   - Fitness Goal: (optional, e.g., "Build Muscle")
4. Click "Save Metrics"
5. See BMI calculated and category assigned!
```

**Expected:**
- BMI: 22.86
- Category: Maintain
- Both displayed in the left card

---

### 2️⃣ Booking - Schedule an Appointment
```
1. Click "Book Appointment" in nav
2. Select:
   - Trainer: John (Trainer)
   - Date: Pick any future date
   - Time: 09:00 AM
   - Duration: 60 minutes
   - Type: Personal Training
3. Click "Book Appointment"
4. Success! See appointment in list
```

**Test Conflict:**
- Try booking same trainer, same time
- You'll see: "Trainer is not available" message
- Choose different time → Success!

---

### 3️⃣ AI Diet Plan - Generate Personalized Plan
```
1. Click "AI Diet Plan" in nav
2. You'll see your current metrics (from step 1)
3. Click "✨ Generate My 7-Day Diet Plan"
4. Wait 2-3 seconds for AI response
5. See beautiful 7-day meal plan!
```

**What you'll see:**
- Day 1: Breakfast, Lunch, Dinner with specific foods
- Day 2-7: Similar breakdowns
- Customized for your BMI and fitness goal

---

## 📱 Testing Key Features

### ✅ BMI Categories
Try different metrics to see categories change:

| Weight | Height | BMI  | Category   |
|--------|--------|------|-----------|
| 50 kg  | 1.70 m | 17.2 | Mass Gain |
| 70 kg  | 1.75 m | 22.9 | Maintain  |
| 85 kg  | 1.75 m | 27.8 | Fat Loss  |

---

### ✅ Conflict Detection
```
Trainer John's Schedule:
- 09:00-10:00 (already booked)
- 10:00-11:00 (already booked)
- 11:00 onwards (available)

Try booking:
✗ 09:30 → 409 Conflict
✗ 10:30 → Depends on duration
✅ 11:00 → Success!
```

---

### ✅ AI Diet Quality
The Gemini API generates personalized plans:
- Your BMI affects calorie recommendations
- Fitness goal (Fat Loss/Maintain/Mass Gain) affects macros
- Meals include breakfast, lunch, dinner
- Nutritionally balanced recommendations

---

## 🛑 Troubleshooting

### Backend won't start
```bash
# Error: "Port 8080 in use"
# Solution: Edit application.properties
server.port=8081

# Error: Gemini API key invalid
# Solution: Verify key at https://aistudio.google.com/app/apikey
```

### Frontend shows errors
```bash
# Error: "Cannot GET /api/..."
# Solution: Ensure backend is running on http://localhost:8080

# Error: "react-calendar is not defined"
# Solution: Run "npm install react-calendar"

# Error: Library versions conflict
# Solution: Delete node_modules and package-lock.json, reinstall
rm -rf node_modules package-lock.json
npm install
```

### API calls failing
```
Check:
1. Backend running? (http://localhost:8080/api/health/metrics/1)
2. API key valid? (Check application.properties)
3. CORS enabled? (Backend allows http://localhost:5173)
4. Network tab in DevTools for actual error
```

---

## 📚 Learn the Code

### Backend Structure
```
backend/src/main/java/com/flexipulse/
├── entity/        → Database models
├── repository/    → Data access
├── service/       → Business logic ⭐ (see BMI calculation here)
└── controller/    → REST endpoints
```

### Frontend Structure
```
frontend/src/
├── pages/         → Full pages (Dashboard, Booking, Diet)
├── components/    → Reusable parts (Navigation)
├── services/      → API calls (apiService.js)
└── App.jsx        → Routing
```

---

## 🔑 Key Endpoints to Know

### Get Your Metrics
```bash
curl http://localhost:8080/api/health/metrics/1
```

### Book Appointment
```bash
curl -X POST "http://localhost:8080/api/appointments/book?userId=1&trainerId=2&appointmentDate=2024-12-25T09:00:00&durationMinutes=60"
```

### Generate Diet Plan
```bash
curl -X POST http://localhost:8080/api/nutrition/diet-plan/1
```

---

## 💡 Tips & Tricks

1. **DevTools → Network Tab** - See all API requests/responses
2. **Browser Console** - Check for errors
3. **Keep Terminals Open** - See server logs
4. **Hot Reload** - Frontend auto-updates on code changes
5. **H2 Console** - Visit http://localhost:8080/h2-console to see database

---

## 🎓 What You're Running

```
You have a full PRODUCTION-ready system:

✅ Java Spring Boot Backend
   - RESTful API
   - H2 Database
   - Service layer with business logic
   - Gemini AI integration

✅ React Frontend  
   - Modern component-based UI
   - Tailwind CSS styling
   - Real-time form validation
   - Beautiful error handling

✅ Features
   - BMI calculation & categories
   - Conflict-free booking system
   - AI-powered diet planning
   - Fully responsive design
```

---

## 📝 Next Steps

After testing:

1. **Read** `IMPLEMENTATION_SUMMARY.md` - Understand the architecture
2. **Explore** the code - See how it works
3. **Modify** - Add your own features
4. **Deploy** - Use `pom.xml` and `npm run build` for production
5. **Scale** - Move from H2 to PostgreSQL, add authentication

---

## 🎯 Success Indicators

You know it's working when:

- [ ] Backend console shows: "Tomcat started on port 8080"
- [ ] Frontend console shows: "VITE ready on http://localhost:5173"
- [ ] Dashboard loads with input form
- [ ] Metrics save and show BMI
- [ ] Booking page has calendar and dropdown
- [ ] Diet page generates 7-day plan
- [ ] No red errors in browser console

---

## 📞 Need Help?

Check:
1. **README.md** - Complete documentation
2. **IMPLEMENTATION_SUMMARY.md** - Architecture details
3. **GEMINI_API_SETUP.md** - API key help
4. **Backend console** - Check for exceptions
5. **Browser DevTools** - Check network errors

---

## 🎉 You're Ready!

**Your FlexiPulse system is now running!**

Congrats! You have a fully functional smart gym management system running locally.

---

**FlexiPulse Quick Start & 5-minute setup ⚡**
