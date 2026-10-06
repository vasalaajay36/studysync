<div align="center">

# StudySync

### Student Productivity & Academic Management Platform

A full-stack academic productivity application built with **React, Java, Spring Boot, MySQL, JPA/Hibernate, HTML, CSS, and JavaScript**.

<p>
  <a href="https://studysync-production-7698.up.railway.app/">Live Demo</a> •
  <a href="https://github.com/vasalaajay36/studysync">Source Code</a>
</p>

<p>
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/MySQL-9.7-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JPA%20%2F%20Hibernate-ORM-59666C?style=for-the-badge&logo=hibernate&logoColor=white" alt="JPA Hibernate" />
</p>

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven" />
  <img src="https://img.shields.io/badge/Railway-Deployment-000000?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
</p>

</div>

---

## Live Demo

**Live Application:** https://studysync-production-7698.up.railway.app/

**Source Code:** https://github.com/vasalaajay36/studysync

> The deployed application runs on Railway with the Spring Boot backend and MySQL database hosted in the cloud. Users can access the application from a browser without running the backend locally.

## Overview

StudySync is a full-stack academic productivity application designed to help students manage their academic information and study activities from one place.

The application provides REST APIs and a browser-based frontend for managing:

- Students
- Subjects
- Tasks
- Study sessions
- Coding-platform profiles and statistics
- Smart dashboard insights and weekly study analytics
- Guided Pomodoro-style Focus Mode with short/long breaks
- Session-protected routes and hardened authentication cookies
- Student dashboard information

## Features

### Authentication and Student Accounts

- Register with name, email, course, and password
- Sign in with email and password
- Passwords are stored as BCrypt hashes
- Server-side sessions scope student data to the authenticated account
- View and update your own student information
- Delete your own account and associated academic data

### Subject Management

- Create subjects
- View all subjects
- View a subject by ID
- Update subjects
- Delete subjects
- View subjects for a specific student

### Task Management

- Create tasks
- View all tasks
- View a task by ID
- Update tasks
- Delete tasks
- View tasks for a specific student

### Study Session Management

- Create study sessions
- View all study sessions
- View a session by ID
- Update study sessions
- Delete study sessions
- View study sessions for a specific student

### Dashboard

- Retrieve dashboard information for the authenticated student
- Aggregate academic/productivity information through a dedicated dashboard API

### Coding Platform Profiles

- Save, edit, and delete coding profiles
- Store username, profile URL, solved problems, rating, ranks, contests, streak, and highest rating
- Automatically fetch supported **LeetCode** profiles
- Automatically fetch supported **Codeforces** profiles
- Gracefully report expired sessions, invalid usernames, upstream API failures, and timeouts
- Manually enter statistics for platforms without automatic API integration

## Screenshots

> Screenshots can be added here after capturing the deployed application. Recommended screenshots: Dashboard, Task Management, Subject Management, and Study Sessions.

## Tech Stack

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Spring Validation
- Maven
- Lombok

### Database

- MySQL

### Frontend

- React 19
- Vite
- HTML5
- CSS3
- JavaScript

### Development & Testing

- Git
- GitHub
- Postman
- macOS

### Deployment

- Railway

## Architecture

StudySync follows a layered Spring Boot architecture:

```text
Frontend (HTML / CSS / JavaScript)
                |
                v
        REST Controllers
                |
                v
            Services
                |
                v
         JPA Repositories
                |
                v
        MySQL Database
```

The backend is organized into controllers, services, repositories, entities, DTOs, and exception handling components.

## Project Structure

```text
src/main/java/com/studysync/
├── controller/
│   ├── AuthController.java
│   ├── CodingPlatformController.java
│   ├── DashboardController.java
│   ├── StudentController.java
│   ├── StudySessionController.java
│   ├── SubjectController.java
│   └── TaskController.java
├── dto/
│   ├── AuthRequest.java
│   ├── CodingPlatformRequest.java
│   ├── CodingPlatformResponse.java
│   ├── DashboardResponse.java
│   ├── RegisterRequest.java
│   ├── StudentRequest.java
│   ├── StudentResponse.java
│   ├── StudySessionRequest.java
│   ├── StudySessionResponse.java
│   ├── SubjectRequest.java
│   ├── SubjectResponse.java
│   ├── TaskRequest.java
│   └── TaskResponse.java
├── entity/
│   ├── CodingPlatform.java
│   ├── Student.java
│   ├── StudySession.java
│   ├── Subject.java
│   └── Task.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── StudentNotFoundException.java
│   ├── StudySessionNotFoundException.java
│   ├── SubjectNotFoundException.java
│   └── TaskNotFoundException.java
├── repository/
│   ├── CodingPlatformRepository.java
│   ├── StudentRepository.java
│   ├── StudySessionRepository.java
│   ├── SubjectRepository.java
│   └── TaskRepository.java
├── service/
│   ├── CodingPlatformService.java
│   ├── DashboardService.java
│   ├── StudentService.java
│   ├── StudySessionService.java
│   ├── SubjectService.java
│   └── TaskService.java
└── StudysyncApplication.java

src/main/resources/
├── static/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── application.properties
```

## REST API

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in with email and password |
| GET | `/api/auth/me` | Return the authenticated student |
| POST | `/api/auth/logout` | Invalidate the current session |

All task, subject, study-session, dashboard, and coding-profile APIs require a valid login session. Data ownership is determined by the authenticated server-side session, not by a client-supplied student ID.

Base URL for the deployed application:

```text
https://studysync-production-7698.up.railway.app
```

### Students (login required)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | Get the current student's profile |
| GET | `/api/students/{id}` | Get your own profile by ID |
| PUT | `/api/students/{id}` | Update your own profile |
| DELETE | `/api/students/{id}` | Delete your own account and related data |

Account creation is handled by `POST /api/auth/register`; the legacy `POST /api/students` route returns `405 Method Not Allowed` so accounts cannot be created without password authentication.

### Subjects (login required)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/subjects/{id}` | Get subject by ID |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/{id}` | Update subject |
| DELETE | `/api/subjects/{id}` | Delete subject |
| GET | `/api/subjects/student/{studentId}` | Get subjects for a student |

### Tasks (login required)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/student/{studentId}` | Get tasks for a student |

### Study Sessions (login required)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/study-sessions` | Get all study sessions |
| GET | `/api/study-sessions/{id}` | Get session by ID |
| POST | `/api/study-sessions` | Create study session |
| PUT | `/api/study-sessions/{id}` | Update study session |
| DELETE | `/api/study-sessions/{id}` | Delete study session |
| GET | `/api/study-sessions/student/{studentId}` | Get sessions for a student |

### Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard information for the authenticated student |
| GET | `/api/dashboard/{studentId}` | Get dashboard information when the path ID matches the authenticated student |

### Study Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/analytics?days=7` | Get authenticated student's study consistency, completed focus time, daily study chart data, top topics, and task completion rate |

The analytics window supports 7–30 days.

### Coding Platforms

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/coding-platforms` | List coding profiles for the authenticated student |
| POST | `/api/coding-platforms` | Create a coding profile |
| PUT | `/api/coding-platforms/{id}` | Update your coding profile |
| DELETE | `/api/coding-platforms/{id}` | Delete your coding profile |
| POST | `/api/coding-platforms/fetch?platform=...&username=...` | Fetch supported profile statistics without saving them |

Automatic profile fetching currently supports **LeetCode** and **Codeforces**.

### Study Timer

- Creating a study session automatically starts its focus timer.
- The timer is persisted in browser storage, so changing StudySync pages or browser tabs does not reset it.
- The timer is synchronized across open StudySync tabs.
- Use **Pause**, **Resume**, and **Stop** from the floating timer.
- Use **Pop out** in supported Chrome versions to keep the timer in a floating Picture-in-Picture window above other work.
- Browser notifications can show remaining time while you work in another tab and notify you when the session finishes.
- The timer uses the session's actual duration and marks the study session completed when the countdown reaches zero.

## Local Setup

### Prerequisites

Install:

- Java 21
- Maven 3.9+
- MySQL
- Git

### Clone the repository

```bash
git clone https://github.com/vasalaajay36/studysync.git
cd studysync
```

### Configure MySQL

Create a MySQL database named:

```sql
CREATE DATABASE studysync_db;
```

Set the database credentials using environment variables:

```bash
export DB_URL="jdbc:mysql://localhost:3306/studysync_db"
export DB_USERNAME="root"
export DB_PASSWORD="your_mysql_password"
```

The application is configured to use these environment variables. Do not commit real database passwords to GitHub. The Maven build downloads a compatible Node.js runtime, builds the React frontend, and packages it into the Spring Boot static resources.

### Run the application

Using the Maven wrapper:

```bash
./mvnw spring-boot:run
```

Or with Maven installed:

```bash
mvn spring-boot:run
```

Then open:

```text
http://localhost:8080
```

## Build

The Maven build installs frontend dependencies, builds React, and then compiles/tests the Spring Boot backend. To verify the full application:

```bash
./mvnw clean test
```

## API Testing with Postman

The REST APIs can be tested with Postman using the deployed base URL or the local URL.

Example:

```text
GET https://studysync-production-7698.up.railway.app/api/students
```

For POST/PUT requests, use:

```text
Content-Type: application/json
```

and provide the appropriate JSON request body.

## Deployment

StudySync is deployed using Railway.

Production architecture:

```text
User Browser
     |
     v
Railway Public URL
     |
     v
Spring Boot Application
     |
     v
Spring Data JPA / Hibernate
     |
     v
Railway MySQL
```

Production database credentials are supplied through Railway environment variables rather than committed to the repository.

## Security Notes

- Never commit database passwords, API keys, tokens, or other secrets.
- Production credentials should be stored in environment variables or a managed secrets system.
- The `application.properties` configuration supports environment variables for database connectivity.

## Learning Goals

This project was built to practice and demonstrate:

- Java and object-oriented programming
- Spring Boot application structure
- Dependency injection
- REST API development
- HTTP methods and status codes
- DTOs and request/response handling
- Validation
- Service and repository layers
- JPA/Hibernate
- MySQL integration
- Exception handling
- Frontend-to-backend communication
- Git and GitHub
- API testing with Postman
- Cloud deployment

## Author

**Ajay Vasala**

GitHub: https://github.com/vasalaajay36
