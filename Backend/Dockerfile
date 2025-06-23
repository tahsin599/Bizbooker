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

