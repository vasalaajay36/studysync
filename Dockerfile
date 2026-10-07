# Build the React frontend on glibc-based Linux to avoid Alpine/native
# optional-dependency issues with Vite/Rollup packages.
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# Build the Spring Boot application with a fixed JDK/Maven toolchain.
FROM maven:3.9.16-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY pom.xml ./
COPY src/ src/
COPY --from=frontend-build /app/frontend/dist frontend/dist

# The frontend has already been built in the first stage.
RUN mvn -B -DskipTests -Dfrontend.skip=true clean package

# Small production runtime image.
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=backend-build /app/target/studysync-0.0.1-SNAPSHOT.jar app.jar

ENV JAVA_OPTS=""
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
