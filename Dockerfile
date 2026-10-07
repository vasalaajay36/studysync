# Stage 1: build the React frontend
FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Stage 2: build the Spring Boot application
FROM maven:3.9.11-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY pom.xml ./
COPY src ./src
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN mvn -B -DskipTests -Dfrontend.skip=true clean package


# Stage 3: run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=backend-build /app/target/studysync-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
