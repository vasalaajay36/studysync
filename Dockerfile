FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
COPY frontend ./frontend
COPY railway.json .

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/studysync-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java -jar app.jar"]
