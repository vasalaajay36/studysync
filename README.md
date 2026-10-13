<div align="center">

# StudySync

### Student Productivity & Academic Management Platform

A full-stack academic productivity application built with **React, Java, Spring Boot, MySQL, JPA/Hibernate, HTML, CSS, and JavaScript**.

<p>
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
  <img src="https://img.shields.io/badge/Render-Deployment-000000?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
</p>

</div>

---

## Live Demo

**Source Code:** https://github.com/vasalaajay36/studysync

> Deployment target: Render Docker Web Service. A publicly reachable MySQL-compatible database must be configured separately. Add the deployed URL here after the Render deployment and database connection have been verified.

## Overview

StudySync is a full-stack academic productivity application designed to help students manage their academic information and study activities from one place.

The application provides REST APIs and a browser-based frontend for managing:

- Students
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
- Automatically fetch public profile statistics for **LeetCode** and **Codeforces**
- Save profile URLs and manually entered statistics for other supported platforms
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

StudySync is configured for deployment as a Docker Web Service on Render.

Production architecture:

```text
User Browser
     |
     v
Render Public URL
     |
     v
Spring Boot Application + bundled React frontend
     |
     v
Spring Data JPA / Hibernate
     |
     v
External MySQL-compatible Database
```

### Deploy on Render

1. Create a MySQL-compatible database with public network access enabled and TLS/SSL required. Keep its credentials private.
2. In Render, select **New → Blueprint** and connect `vasalaajay36/studysync`. Render reads the root `render.yaml` and configures the Docker web service.
3. In the StudySync service's **Environment** settings, add:
   - `DB_URL`: JDBC URL such as `jdbc:mysql://DB_HOST:DB_PORT/DB_NAME?sslMode=REQUIRED` (replace the placeholders with the exact values supplied by your database provider).
   - `DB_USERNAME`: database username.
   - `DB_PASSWORD`: database password.
   - `COOKIE_SECURE`: `true`.
4. Save and deploy. Render builds the existing multi-stage `Dockerfile`; the React frontend and Spring Boot API share one origin.
5. Wait for the service to become **Live**, then open its generated `onrender.com` URL. Test registration/login, navigation, task/subject/session CRUD, and coding profiles.
6. Add the new public URL to the Live Demo section only after the deployment and database connection have been verified.

Render hosts the application; the MySQL database is separate. The database provider must allow inbound connections from Render and support TLS. A database running on your own computer is not reachable by the cloud service.

Production credentials belong in environment variables, not in GitHub.
 
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
