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

> Deployment target: Render Docker Web Service. Configure a reachable PostgreSQL database using Render's `DATABASE_URL` connection string, or configure MySQL using the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` variables. Add the public URL here only after deployment and database connectivity are verified.

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
- Automatically fetch public profile statistics for **LeetCode, Codeforces, CodeChef, HackerRank, SPOJ, and CSES**
- Refresh saved profiles and persist updated statistics
- Gracefully report expired sessions, invalid usernames, upstream API failures, and timeouts
- Allow manual entry when an external platform temporarily blocks requests or does not expose a statistic

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

- MySQL or PostgreSQL (depending on the configured production connection URL)

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

Supported production architecture (separate frontend):

```text
Browser
  |
  v
Netlify or Vercel frontend
  |  /api/* proxy (same-origin browser requests)
  v
Render Spring Boot backend
  |
  v
Spring Data JPA / Hibernate
  |
  v
External MySQL-compatible or PostgreSQL database
```

The root Dockerfile also packages the React build into Spring Boot, so a combined single-origin deployment is supported. For a separately hosted frontend, keep `frontend/netlify.toml`, `frontend/public/_redirects`, and `frontend/vercel.json` pointed at the same backend. The current proxy target is `https://studysync-hmji.onrender.com`; verify the Render service is healthy before relying on it.

### Deploy on Render

1. Create a managed PostgreSQL database in Render (recommended) or use an external PostgreSQL provider. Keep its credentials private.
2. In Render, select **New → Blueprint** and connect `vasalaajay36/studysync`. Render reads the root `render.yaml` and configures the Docker web service.
3. In the StudySync service's **Environment** settings, configure **one** database connection method:
   - **PostgreSQL (recommended):** set `DATABASE_URL` to the PostgreSQL connection URL supplied by Render/provider (typically begins with `postgres://` or `postgresql://`). `DatabaseConfig` converts it to a JDBC URL and extracts the connection credentials.
   - **JDBC URL alternative:** set `DB_URL` to a complete JDBC URL such as `jdbc:postgresql://DB_HOST:DB_PORT/DB_NAME?sslmode=require`, and set `DB_USERNAME` and `DB_PASSWORD`.
   - For existing MySQL installations, `DB_URL` may be a MySQL JDBC URL and `DB_USERNAME` / `DB_PASSWORD` should contain the corresponding credentials.
   - Set `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none` for a separately hosted HTTPS frontend, and set `CORS_ALLOWED_ORIGINS` to the exact frontend origin(s) when direct cross-origin API requests are used.
   - **Important:** if both `DATABASE_URL` and `DB_URL` are configured, a supported scheme-based `DATABASE_URL` takes precedence.
4. Save and deploy. Render builds the existing multi-stage `Dockerfile`; the React frontend and Spring Boot API share one origin on the backend service.
5. Wait for the service to become **Live** and verify `/health`. Then test registration/login, protected page navigation, task/subject/session CRUD, and coding-profile fetch/save/refresh/delete.
6. Add the public URL to the Live Demo section only after the deployment and database connection have been verified.

Render hosts the application; the database may be a separate managed PostgreSQL or MySQL service. The database provider must allow inbound connections from the application and support the configured TLS mode. A database running on your own computer is not reachable by the cloud service.

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
