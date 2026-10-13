# StudySync — Render & PostgreSQL Deployment Guide

This document describes how to deploy the **StudySync Spring Boot Backend** to **[Render](https://render.com)** using **PostgreSQL**.

---

## 🚀 Deployment Options on Render

You can deploy StudySync using any of the following 3 approaches:

### Option 1: One-Click Render Blueprint (Recommended)

1. Push your repository to **GitHub**.
2. Log into the **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository (`studysync` or the repository containing the backend).
   - If the repository has the backend at the root: select `./render.yaml`.
   - If the repository is a monorepo where the backend is nested: set the Blueprint path to `backend/backend/render.yaml`.
5. Render will detect `render.yaml` and automatically configure:
   - A free-tier **PostgreSQL database** (`studysync-postgres`).
   - A free-tier **Web Service** (`studysync-backend`) using the optimized multi-stage `Dockerfile`.
   - Automatic database linkage (`DATABASE_URL` is wired directly into the web service).
6. Click **Apply**. Render will provision the database, build the Docker container, and start your backend service!

---

### Option 2: Deploy as a Docker Web Service (Manual)

1. In Render, create your PostgreSQL database:
   - Click **New +** > **PostgreSQL**.
   - Name: `studysync-postgres`.
   - Database: `studysync_db`.
   - User: `studysync_user`.
   - Plan: **Free**.
   - Click **Create Database**.
   - Copy the **Internal Database URL** (e.g., `postgres://studysync_user:pass@dpg-xxx:5432/studysync_db`).
2. Create your Web Service:
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory**: Leave blank if repo root contains `pom.xml` / `Dockerfile`; set to `backend/backend` if nested.
   - **Environment**: **Docker**.
   - **Dockerfile Path**: `./Dockerfile`.
   - **Plan**: Free.
3. Configure Environment Variables in the Web Service settings:
   | Key | Value / Source | Description |
   | --- | --- | --- |
   | `DATABASE_URL` | From linked PostgreSQL database, or paste **Internal Database URL** | Handled automatically by `DatabaseConfig` |
   | `PORT` | `10000` | Render port (auto-set by Render) |
   | `COOKIE_SECURE` | `true` | Enables secure session cookies over HTTPS |
   | `COOKIE_SAME_SITE` | `none` | Allows session cookies across domains (if frontend is hosted separately) |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app,https://your-frontend.onrender.com` | Your frontend production URL |
4. Click **Create Web Service**.

---

### Option 3: Deploy as Native Java Web Service (No Docker)

If you prefer using Render's native Java environment instead of Docker:
1. **Root Directory**: `.` (or `backend/backend` if nested).
2. **Environment**: **Java**.
3. **Build Command**: `./mvnw clean package -DskipTests`
4. **Start Command**: `java -jar target/studysync-0.0.1-SNAPSHOT.jar`
5. **Environment Variables**:
   - `JAVA_VERSION`: `21`
   - `DATABASE_URL`: Your Render PostgreSQL database URL (or `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).
   - `COOKIE_SECURE`: `true`
   - `COOKIE_SAME_SITE`: `none`

---

## 🛠️ Summary of Changes Made to the Codebase

1. **PostgreSQL Driver Added (`pom.xml`)**:
   - Added `org.postgresql:postgresql` runtime dependency.
   - Maintained MySQL connector compatibility for legacy environments.
   - Moved `frontend-maven-plugin` into an optional Maven profile activated only when `frontend/package.json` exists, ensuring clean backend-only packaging without build failures.

2. **Automated Render URL Parser (`DatabaseConfig.java`)**:
   - Automatically intercepts Render's `DATABASE_URL` (in `postgres://user:pass@host:port/db` or `postgresql://...` format).
   - Converts the URL into a standard JDBC URL (`jdbc:postgresql://host:port/db`), extracts credentials, and applies them to HikariCP.
   - Sets `initializationFailTimeout = -1` to avoid fast startup crashes if cloud database warming is delayed.
   - Gracefully falls back to standard properties (`spring.datasource.url`, `DB_URL`, or `application.properties`) for local development and testing.

3. **Application Properties (`application.properties`)**:
   - Defaults to PostgreSQL on port 5432: `jdbc:postgresql://localhost:5432/studysync_db`.
   - Injects `PORT` dynamically from Render.
   - Configurable session cookie security (`COOKIE_SECURE`, `COOKIE_SAME_SITE`) for cross-domain frontend communication.
   - Disabled `spring.jpa.open-in-view` to optimize memory and suppress warnings.

4. **Enhanced CORS Configuration (`WebConfig.java`)**:
   - Dynamically supports `CORS_ALLOWED_ORIGINS` environment variable.
   - Allows origins matching `*.onrender.com`, `*.vercel.app`, `*.netlify.app`, and `localhost`.
   - Preserves credentials (`allowCredentials: true`) for cookie-based authentication.

5. **Production Dockerfile & .dockerignore**:
   - Multi-stage build using `eclipse-temurin:21-jdk-jammy` and `eclipse-temurin:21-jre-jammy`.
   - Runs with a non-root `spring` user.
   - Container-aware JVM memory settings (`-XX:MaxRAMPercentage=75.0`).

6. **Render Blueprint (`render.yaml`)**:
   - Defines unified blueprint for 1-click provisioning of PostgreSQL and the Web Service.

---

## 🧪 Testing Locally with PostgreSQL

If you want to run PostgreSQL locally:
```bash
# Start a local PostgreSQL instance via Docker
docker run --name studysync-postgres -e POSTGRES_DB=studysync_db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Run the backend locally
./mvnw spring-boot:run
```
