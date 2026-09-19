<div align="center">

# StudySync

### Student Productivity & Academic Management Platform

A full-stack academic productivity application built with **Java, Spring Boot, MySQL, JPA/Hibernate, HTML, CSS, and JavaScript**.

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
- Student dashboard information

## Features

### Student Management

- Create a student
- View all students
- View a student by ID
- Update student information
- Delete a student

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

- Retrieve dashboard information for a student
- Aggregate academic/productivity information through a dedicated dashboard API

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
│   ├── DashboardController.java
│   ├── StudentController.java
│   ├── StudySessionController.java
│   ├── SubjectController.java
│   └── TaskController.java
├── dto/
│   ├── DashboardResponse.java
│   ├── StudentRequest.java
│   ├── StudentResponse.java
│   ├── StudySessionRequest.java
│   ├── StudySessionResponse.java
│   ├── SubjectRequest.java
│   ├── SubjectResponse.java
│   ├── TaskRequest.java
│   └── TaskResponse.java
├── entity/
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
│   ├── StudentRepository.java
│   ├── StudySessionRepository.java
│   ├── SubjectRepository.java
│   └── TaskRepository.java
├── service/
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

Base URL for the deployed application:

```text
https://studysync-production-7698.up.railway.app
```

### Students

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | Get all students |
| GET | `/api/students/{id}` | Get student by ID |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Subjects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/subjects/{id}` | Get subject by ID |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/{id}` | Update subject |
| DELETE | `/api/subjects/{id}` | Delete subject |
| GET | `/api/subjects/student/{studentId}` | Get subjects for a student |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/student/{studentId}` | Get tasks for a student |

### Study Sessions

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
| GET | `/api/dashboard/{studentId}` | Get dashboard information for a student |

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

The application is configured to use these environment variables. Do not commit real database passwords to GitHub.

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

To verify the project compiles successfully:

```bash
mvn clean compile
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
