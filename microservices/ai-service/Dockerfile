FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copy pom files first for better caching
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B || mvn dependency:resolve -B
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B -Dmaven.repo.local=/root/.m2/repository

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/ai-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
