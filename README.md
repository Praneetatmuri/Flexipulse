# FlexiPulse

FlexiPulse is a full-stack fitness platform with:
- JWT-based authentication (Member and Trainer roles)
- Health metric tracking (BMI and workout category)
- Appointment booking with trainer leave blocking
- AI diet plan generation with Gemini
- Diet plan history and PDF export support in the UI

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- H2 in-memory database
- Maven

### Frontend
- React + Vite
- React Router
- Axios
- Recharts
- React Calendar
- React Hot Toast

## Repository Layout

- backend: Spring Boot API and business logic
- frontend: React application
- README.md: Project guide

## Core Features

1. Authentication and authorization
- User registration and login
- JWT token issuance on login
- Role-based access control for Trainer-only routes

2. Health dashboard
- Save user height and weight
- Automatic BMI and workout category
- Weight trend chart

3. Appointments
- Book trainer appointments
- View all appointments
- Prevent booking on trainer leave blocks

4. Trainer management
- Trainer can add and remove members
- Trainer can create and remove leave blocks

5. AI nutrition
- Generate personalized diet plans from user metrics and preferences
- Graceful fallback response when Gemini is unavailable
- View recent generated plans
- Export generated plan to PDF from the frontend

## Environment Variables

Set these before running backend:

- GEMINI_API_KEY: Gemini API key for AI diet generation
- JWT_SECRET: JWT signing secret (optional in dev, recommended in production)

PowerShell example:

```powershell
$env:GEMINI_API_KEY="your_actual_key_here"
$env:JWT_SECRET="your_strong_secret_here"
```

## Local Development

### 1) Start backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend default URL:
- http://localhost:8080

H2 console:
- http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:flexipulsedb
- Username: sa
- Password: (empty)

### 2) Start frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL:
- http://localhost:5173

## API Base URL

Frontend currently calls:
- http://localhost:8080

Configured in:
- frontend/src/services/apiService.js

## Authentication Flow

1. Register or login via /users endpoints
2. Backend returns JWT token on successful login
3. Frontend stores token in localStorage
4. Axios interceptor adds Authorization: Bearer <token>

## API Endpoints (Current)

### Users
- POST /users/register
- POST /users/login
- GET /users/all
- POST /users/trainer/add-member (TRAINER)
- DELETE /users/trainer/remove-member/{memberId} (TRAINER)
- DELETE /users/{id}

### Health
- POST /health/save
- POST /health/calculate
- GET /health/all
- GET /health/user/{userId}

### Appointments
- POST /appointments/book
- GET /appointments/all

### Trainer Leave Blocks
- POST /trainer/leave-blocks (TRAINER)
- DELETE /trainer/leave-blocks/{id} (TRAINER)
- GET /trainer/leave-blocks (TRAINER)
- GET /trainer/leave-blocks/all

### Nutrition
- POST /nutrition/diet-plan
- POST /nutrition/meal-suggestions
- GET /nutrition/api-status
- GET /nutrition/diet-plan/history/{userId}

## Security Notes

- /users/register and /users/login are public
- Most other endpoints require JWT authentication
- Trainer endpoints are protected by role checks
- Gemini API key is loaded from environment variable, not hardcoded in application properties

## Build Commands

### Frontend

```powershell
cd frontend
npm run build
```

### Backend tests

```powershell
cd backend
.\mvnw.cmd test
```

## Troubleshooting

1. Port already in use
- Change backend port in backend/src/main/resources/application.properties

2. AI plan not generating
- Verify GEMINI_API_KEY is set in the same terminal session where backend is started
- Check /nutrition/api-status

3. Unauthorized errors after backend restart
- Login again to refresh JWT token in frontend

## Production Readiness Checklist

- Replace H2 with a persistent database
- Set a strong JWT_SECRET
- Use environment-based config per environment
- Add centralized logging/monitoring
- Add CI pipeline for build and test

## License

This repository currently has no explicit license file.
