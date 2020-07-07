FROM openjdk:8-jdk-alpine

# Add Maintainer Info
LABEL maintainer="Rescribe"

# Create app directory
WORKDIR /app

COPY build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
