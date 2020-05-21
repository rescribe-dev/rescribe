FROM openjdk:8-jdk-alpine

# Create app directory
WORKDIR /usr/src/app

COPY build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
