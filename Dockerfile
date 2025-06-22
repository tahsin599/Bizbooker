# ================================
# Stage 1: Build React Frontend
# ================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy only package files first for caching
COPY bizbooker_frontend/package*.json ./

# Install dependencies (avoid `ci` to ensure devDependencies are included)
RUN npm install --silent

# Copy full React app source and build it
COPY bizbooker_frontend/ ./
RUN npm run build

# ================================
# Stage 2: Build Spring Boot Backend
# ================================
FROM maven:3.9.4-eclipse-temurin-17 AS Backend-build

WORKDIR /app/Backend

# Copy pom.xml first to cache dependencies
COPY Backend/pom.xml ./
RUN mvn dependency:go-offline -B --quiet

# Copy Backend source code
COPY Backend/src ./src

# Copy built React app into Spring Boot's static folder
COPY --from=frontend-build /app/frontend/build ./src/main/resources/static/

# Build Spring Boot application
RUN mvn clean package -DskipTests -B --quiet

# ================================
# Stage 3: Runtime Image
# ================================
FROM eclipse-temurin:17-jdk-jammy AS runtime

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create user and working dir
RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app

# Copy the JAR file from previous stage
COPY --from=Backend-build /app/Backend/target/*.jar app.jar
RUN chown appuser:appuser app.jar

USER appuser

EXPOSE 8080

# Optional healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM options and run
ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
