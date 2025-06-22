# # Stage 1: Build with Maven
# FROM maven:3.9.4-eclipse-temurin-17 AS build

# WORKDIR /app

# # # Copy pom.xml and download dependencies first (for caching)
# # COPY pom.xml ./
# # RUN mvn dependency:go-offline -B --quiet

# # # Copy source code
# # COPY src ./src

# # # Copy .env into src/main/resources so it will be packaged inside the JAR


# # # Build the Spring Boot JAR
# # RUN mvn clean package -DskipTests -B --quiet

# # # Stage 2: Runtime
# # FROM eclipse-temurin:17-jdk-jammy

# # WORKDIR /app

# # # Copy the built jar from the build stage
# # COPY --from=build /app/target/*.jar app.jar

# # EXPOSE 8080

# # ENTRYPOINT ["java", "-jar", "app.jar"]

# export DATASOURCE_URL="dbc:mysql://localhost:3306/bizbooker"
# export DATASOURCE_USER="root"
# export DATASOURCE_PASSWORD="tahsinsiam599"

# export FRONTEND_URL="http://localhost:3000"


FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

copy pom.xml ./
RUN mvn dependency:go-offline -B --quiet

COPY src ./src
RUN mvn clean package -DskipTests -B --quiet


FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar .

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/backend-0.0.1-SNAPSHOT.jar"]
