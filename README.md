# 💪 FlexiPulse - Smart Gym & Health Management System

A full-stack application for managing gym memberships, health metrics, appointment bookings, and AI-powered personalized diet plans.

## 🎯 Project Features

### Backend (Spring Boot)
- ✅ **User Management** - Create and manage user accounts and trainer profiles
- ✅ **Health Metrics** - Track BMI, weight, height, and fitness goals
- ✅ **Smart BMI Calculator** - Automatically categorizes users into: Mass Gain, Maintain, or Fat Loss
- ✅ **Conflict-Free Appointment Booking** - Ensures trainers aren't double-booked (409 Conflict on overlap)
- ✅ **AI Diet Planning** - Integrates Google Gemini API for personalized 7-day diet plans
- ✅ **RESTful API** - Clean Controller-Service-Repository architecture

### Frontend (React + Vite)
- ✅ **Health Dashboard** - View and update health metrics with real-time BMI calculation
- ✅ **Appointment Booking** - Interactive calendar and time selector with error handling
- ✅ **AI Diet Section** - Generate personalized diet plans with beautiful JSON rendering
- ✅ **Responsive Design** - Tailwind CSS with mobile-first approach
- ✅ **Real-time Validation** - Handles unavailable time slots gracefully

## 🏗️ Tech Stack

### Backend
- **Java 17** with Spring Boot 3
- **Spring Data JPA** for database operations
- **H2 In-Memory Database** for development/testing
- **Lombok** for reducing boilerplate code
- **RestTemplate** for Gemini API integration
- **Maven** for dependency management

### Frontend
- **React 19.2.4** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Calendar** for appointment booking
- **ESLint** for code quality

## 📋 Project Structure

```
flexipulse/
├── backend/
│   ├── pom.xml
│   ├── src/main/
│   │   ├── java/com/flexipulse/
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── HealthMetric.java
│   │   │   │   └── Appointment.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── HealthMetricRepository.java
│   │   │   │   └── AppointmentRepository.java
│   │   │   ├── service/
│   │   │   │   ├── HealthMetricService.java
│   │   │   │   ├── AppointmentService.java
│   │   │   │   └── NutritionService.java
│   │   │   ├── controller/
│   │   │   │   ├── HealthController.java
│   │   │   │   ├── AppointmentController.java
│   │   │   │   └── NutritionController.java
│   │   │   ├── dto/
│   │   │   │   ├── HealthMetricDTO.java
│   │   │   │   ├── AppointmentDTO.java
│   │   │   │   ├── DietPlanDTO.java
│   │   │   │   └── ApiResponse.java
│   │   │   └── FlexipulseApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Booking.jsx
    │   │   └── AIDiet.jsx
    │   ├── components/
    │   │   └── Navigation.jsx
    │   ├── services/
    │   │   └── apiService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── App.css
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    ├── package.json
    └── index.html
```

## 🚀 Getting Started

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Google Gemini API Key** (for diet planning feature)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Gemini API Key:**
   - Edit `src/main/resources/application.properties`
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
   ```properties
   gemini.api.key=your_actual_key_here
   ```

3. **Build the project:**
   ```bash
   mvn clean install
   ```

4. **Run the Spring Boot application:**
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start on **http://localhost:8080**

5. **Access H2 Console (optional):**
   - Visit http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:flexipulse`
   - Username: `sa` (password: empty)

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on **http://localhost:5173**

4. **(Optional) Build for production:**
   ```bash
   npm run build
   ```

## 📚 API Endpoints

### Health Metrics
- **POST** `/api/health/metrics` - Create/update health metrics
  - Params: `userId`, `height`, `weight`, `fitnessGoal`
  - Returns: BMI, workout category, fitness goal

- **GET** `/api/health/metrics/{userId}` - Get user's latest metrics

### Appointments
- **POST** `/api/appointments/book` - Book an appointment
  - Params: `userId`, `trainerId`, `appointmentDate`, `durationMinutes`, `appointmentType`
  - Returns: `409 Conflict` if trainer is unavailable

- **GET** `/api/appointments/user/{userId}` - Get user's appointments

- **GET** `/api/appointments/trainer/{trainerId}` - Get trainer's appointments

- **DELETE** `/api/appointments/{appointmentId}` - Cancel appointment

### Nutrition
- **POST** `/api/nutrition/diet-plan/{userId}` - Generate AI diet plan
  - Requires: User health metrics
  - Returns: 7-day personalized diet plan in JSON format

## 🔐 BMI Calculation & Categories

The system calculates BMI using the formula: **BMI = weight(kg) / height(m)²**

Automatic workout categories:
- **BMI < 18.5** → "Mass Gain" (build muscle)
- **18.5 ≤ BMI < 25** → "Maintain" (maintain current fitness)
- **BMI ≥ 25** → "Fat Loss" (cardio focused)

## 🤖 AI Diet Planning

The NutritionService integrates with **Google Gemini AI** to generate personalized diet plans:

1. User's health metrics (BMI, workout category, fitness goal) are sent to Gemini API
2. AI generates a structured 7-day meal plan in JSON format
3. Frontend renders the plan in an easy-to-read format with daily meals

## ⚠️ Conflict-Free Booking Logic

The AppointmentService prevents double-booking:

```
If trainer is busy during [start_time, end_time] → 409 Conflict Response
Otherwise → Appointment created successfully
```

Time slot overlap detection:
- Checks all existing appointments for the trainer
- Validates no overlapping time blocks exist
- Returns clear error message if slot is unavailable

## 🧪 Testing the Features

### 1. **Create User Health Metrics**
   - Navigate to Dashboard
   - Enter height (e.g., 1.75m) and weight (e.g., 70kg)
   - System auto-calculates BMI and workout category

### 2. **Book an Appointment**
   - Go to "Book Appointment"
   - Select a trainer, date, time
   - If trainer is available, appointment is created
   - Try booking overlapping times to see 409 Conflict

### 3. **Generate AI Diet Plan**
   - Go to "AI Diet Plan"
   - Click "Generate My 7-Day Diet Plan"
   - Gemini API generates personalized plan based on your fitness goal

## 🔧 Configuration

### Backend Configuration (application.properties)

```properties
# Server
server.port=8080

# Database (H2 In-Memory)
spring.datasource.url=jdbc:h2:mem:flexipulse
spring.jpa.hibernate.ddl-auto=create-drop

# Gemini API
gemini.api.key=YOUR_API_KEY_HERE
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### Frontend API Configuration (services/apiService.js)

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

Change the `API_BASE_URL` if backend is running on a different port/host.

## 📦 Build & Deployment

### Backend Deployment
```bash
# Create executable JAR
mvn clean package

# Run the JAR
java -jar target/flexipulse-1.0.0.jar
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy the 'dist' folder to any static hosting (Vercel, Netlify, etc.)
```

## 🐛 Troubleshooting

### Backend Issues

**Problem:** "Port 8080 already in use"
```bash
# Change port in application.properties
server.port=8081
```

**Problem:** "Gemini API key not working"
- Verify your API key is valid at https://aistudio.google.com
- Ensure CORS is enabled for your domain

### Frontend Issues

**Problem:** "Cannot GET /api/..." errors
- Ensure backend is running on http://localhost:8080
- Check CORS configuration in backend

**Problem:** Calendar not displaying
- Ensure `react-calendar` is installed: `npm install react-calendar`
- Import CSS: `import 'react-calendar/dist/Calendar.css'`

## 📝 API Response Format

All endpoints return standardized JSON responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Spring Boot MVC architecture with clean separation of concerns
- ✅ JPA relationships (One-to-Many, Many-to-One)
- ✅ Custom business logic for BMI calculation and booking conflicts
- ✅ Third-party API integration (Google Gemini)
- ✅ React functional components and hooks
- ✅ React Router for navigation
- ✅ Axios for HTTP requests
- ✅ Tailwind CSS for responsive design
- ✅ Form validation and error handling
- ✅ Real-time state management with useState/useEffect

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ by the FlexiPulse Team**
