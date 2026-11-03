# ---------- Build ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Download dependencies first so they are cached between builds
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src src
RUN ./mvnw -q -B -DskipTests package && cp target/*.jar app.jar

# ---------- Run ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /app/app.jar app.jar
USER spring

ENV SHOW_SQL=false \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
