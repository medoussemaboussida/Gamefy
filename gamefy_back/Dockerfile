# ============================================================
#  Gamefy Backend — Optimized Multi-Stage Dockerfile
#  Stack: Spring Boot 4.0.2 · Java 21 · Maven · PostgreSQL
# ============================================================

# ─── Stage 1: Dependency Cache ───────────────────────────────
# Downloads and caches all Maven dependencies in a separate
# layer so they are only re-fetched when pom.xml changes.
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS deps

WORKDIR /build

# Copy only the files Maven needs to resolve dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Make the Maven wrapper executable & download dependencies
RUN chmod +x mvnw \
    && ./mvnw dependency:go-offline -B --no-transfer-progress

# ─── Stage 2: Build ─────────────────────────────────────────
# Compiles the application and produces a layered fat JAR.
# Re-uses the cached dependency layer from Stage 1.
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /build

# Bring in cached Maven repo from deps stage
COPY --from=deps /root/.m2 /root/.m2
COPY --from=deps /build/.mvn .mvn
COPY --from=deps /build/mvnw ./

# Copy source code (changes frequently — separate layer)
COPY pom.xml ./
COPY src src

# Build the JAR, skipping tests (tests should run in CI)
RUN chmod +x mvnw \
    && ./mvnw package -DskipTests -B --no-transfer-progress \
    && mkdir -p target/extracted \
    && java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination target/extracted

# ─── Stage 3: Runtime ───────────────────────────────────────
# Minimal JRE-only image with Spring Boot layered JAR for
# optimal Docker layer caching and smallest possible size.
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# ── Security hardening ──
# Non-root user to follow least-privilege principle
RUN addgroup --system --gid 1001 gamefy \
    && adduser --system --uid 1001 --ingroup gamefy gamefy

WORKDIR /app

# ── Copy Spring Boot layered JAR (ordered by change frequency) ──
COPY --from=build /build/target/extracted/dependencies/ ./
COPY --from=build /build/target/extracted/spring-boot-loader/ ./
COPY --from=build /build/target/extracted/snapshot-dependencies/ ./
COPY --from=build /build/target/extracted/application/ ./

# ── Create the uploads directory & grant ownership ──
RUN mkdir -p /app/uploads && chown -R gamefy:gamefy /app

# ── Switch to non-root user ──
USER gamefy

# ── Expose the application port ──
EXPOSE 8080

# ── Health check (Spring Boot Actuator or basic TCP) ──
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api || exit 1

# ── JVM tuning for containers ──
# -XX:+UseContainerSupport   → respects cgroup memory/cpu limits
# -XX:MaxRAMPercentage=75    → use at most 75% of container memory for heap
# -XX:+UseZGC                → low-latency garbage collector (ideal for Java 21)
# -Djava.security.egd        → faster startup (non-blocking entropy source)
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseZGC \
               -Djava.security.egd=file:/dev/./urandom"

# ── Launch with Spring Boot layered launcher ──
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]

# ── Labels (OCI standard) ──
LABEL maintainer="Gamefy Team" \
      org.opencontainers.image.title="gamefy-backend" \
      org.opencontainers.image.description="Gamefy gaming center backend API" \
      org.opencontainers.image.source="https://github.com/medoussemaboussida/Gamefy"
