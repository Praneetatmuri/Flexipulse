# FlexiPulse

AI-Powered Fitness and Wellness Dashboard  
Built with React (Vite) + Spring Boot + Gemini

[Quickstart](#quickstart) · [Features](#features) · [Architecture](#architecture) · [API](#api-reference) · [Troubleshooting](#troubleshooting)

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F)
![Java](https://img.shields.io/badge/Java-17-007396)
![Type](https://img.shields.io/badge/Auth-JWT-orange)
![AI](https://img.shields.io/badge/AI-Gemini-blue)

## What is FlexiPulse?

FlexiPulse is an AI-first gym operations and member wellness platform. It brings member metrics, appointment booking, trainer workflows, and personalized nutrition into one unified dashboard.

Whether you are tracking your health goals or managing members as a trainer, FlexiPulse gives you a real-time command center with actionable insights and AI support.

## Why FlexiPulse?

| Problem | FlexiPulse Solution |
| --- | --- |
| Health tracking is scattered across apps | Centralized dashboard for BMI, progress, and recommendations |
| Booking sessions causes scheduling conflicts | Appointment engine with trainer leave-block conflict prevention |
| Nutrition planning is slow and generic | AI-generated diet plans personalized to goals and constraints |
| Trainers manage members manually | Built-in member management and leave block workflows |

## Features

- JWT auth with role-aware access (MEMBER and TRAINER)
- Health metrics tracking with BMI/workout category calculation
- Real-time trend visualization for member progress
- Appointment booking with trainer availability protection
- Trainer leave block management and member roster controls
- Gemini-powered diet plan generation with fallback behavior
- Diet plan history retrieval and in-app PDF export flow
- Modern responsive UI with dashboard, cards, charts, and guided actions

## Quickstart

### Prerequisites

- Node.js 18+
- Java 17+
- Maven (or use Maven Wrapper)
- Gemini API key (optional but required for live AI responses)

### 1. Clone and install

```bash
git clone https://github.com/Praneetatmuri/Flexipulse.git
cd flexipulse
cd frontend && npm install
```

### 2. Configure environment variables

PowerShell example:

```powershell
$env:GEMINI_API_KEY="your_actual_key_here"
$env:JWT_SECRET="your_strong_secret_here"
```

### 3. Run backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend URL: http://localhost:8080

### 4. Run frontend

```powershell
cd frontend
npm run dev
```

Frontend URL: http://localhost:5173

## Configuration

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| GEMINI_API_KEY | For AI features | Enables live Gemini diet generation |
| JWT_SECRET | Recommended | JWT signing key for authentication |

### Current runtime defaults

- Backend port: `8080`
- Frontend API base URL: `http://localhost:8080`
- DB: H2 in-memory (`jdbc:h2:mem:flexipulsedb`)

## Architecture

```
React App (Vite)
	-> Axios API Client (JWT interceptor)
		-> Spring Boot REST API
			-> Service Layer (Health, Appointments, Nutrition, Trainer Flows)
				-> JPA Repositories
					-> H2 In-Memory DB
			-> Gemini API (diet generation)
```

### Security model

- Public routes: `/users/register`, `/users/login`
- Protected routes: all others require valid JWT
- Trainer-only routes: `/users/trainer/**`, `/trainer/**`

## Project Structure

```
flexipulse/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── src/main/resources/application.properties
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/services/
│   ├── src/App.jsx
│   └── src/App.css
└── README.md
```

## API Reference

### Users

- `POST /users/register`
- `POST /users/login`
- `GET /users/all`
- `POST /users/trainer/add-member` (TRAINER)
- `DELETE /users/trainer/remove-member/{memberId}` (TRAINER)
- `DELETE /users/{id}`

### Health

- `POST /health/save`
- `POST /health/calculate`
- `GET /health/all`
- `GET /health/user/{userId}`

### Appointments

- `POST /appointments/book`
- `GET /appointments/all`

### Trainer Leave Blocks

- `POST /trainer/leave-blocks` (TRAINER)
- `DELETE /trainer/leave-blocks/{id}` (TRAINER)
- `GET /trainer/leave-blocks` (TRAINER)
- `GET /trainer/leave-blocks/all`

### Nutrition

- `POST /nutrition/diet-plan`
- `POST /nutrition/meal-suggestions`
- `GET /nutrition/api-status`
- `GET /nutrition/diet-plan/history/{userId}`

## Build and Test

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

### Backend fails to start on 8080

- Change `server.port` in `backend/src/main/resources/application.properties`

### AI plan not generating

- Ensure `GEMINI_API_KEY` is set in the same terminal session as backend startup
- Verify API readiness at `GET /nutrition/api-status`

### 401/403 after server restart

- Re-login in frontend to refresh JWT token in local storage

## Roadmap Ideas

- Persistent database (PostgreSQL/MySQL)
- Observability (logs, traces, metrics)
- CI for lint/build/test gates
- Production-ready secrets and environment profiles

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch (`feature/your-feature`)
3. Commit your changes
4. Push and open a pull request

## License

No explicit license file is currently present in this repository.
