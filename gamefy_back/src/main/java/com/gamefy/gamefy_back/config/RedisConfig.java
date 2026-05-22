package com.gamefy.gamefy_back.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
@Profile("!test")  // Skip Redis entirely when running tests — NoOpCacheManager is used instead
public class RedisConfig {

    /**
     * Dedicated ObjectMapper for Redis:
     *  - JavaTimeModule  → handles LocalDate, LocalDateTime, ZonedDateTime, etc.
     *  - Default typing  → embeds @class in JSON so values can be deserialized
     *                      back to the correct concrete type without class-cast errors.
     *  - WRITE_DATES_AS_TIMESTAMPS disabled → human-readable ISO-8601 dates in Redis.
     *
     *  Named "redisObjectMapper" to avoid conflicting with Spring Boot's primary
     *  ObjectMapper bean used for HTTP request/response serialization.
     */
    @Bean("redisObjectMapper")
    public ObjectMapper redisObjectMapper() {
        return JsonMapper.builder()
                .addModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .activateDefaultTyping(
                        BasicPolymorphicTypeValidator.builder()
                                .allowIfSubType(Object.class)
                                .build(),
                        ObjectMapper.DefaultTyping.NON_FINAL,
                        JsonTypeInfo.As.PROPERTY
                )
                .build();
    }

    /**
     * Base cache configuration:
     *  - Keys   → plain String serializer
     *  - Values → JSON via GenericJackson2JsonRedisSerializer (JavaTimeModule + type info)
     *  - Null values are never cached
     *
     * Note: GenericJackson2JsonRedisSerializer is marked deprecated in Spring Data Redis 4.0,
     * but remains fully functional. It is still the correct choice when a custom ObjectMapper
     * with default typing is required (the replacement API does not yet support this use-case).
     */
    @SuppressWarnings("deprecation")
    private RedisCacheConfiguration buildCacheConfig(Duration ttl, ObjectMapper objectMapper) {
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(jsonSerializer)
                );
    }

    /**
     * RedisCacheManager with per-cache TTLs:
     *  - "users"        → 10 minutes  (admin write actions evict immediately)
     *  - "reservations" → 2 minutes   (front-office bookings are frequent)
     *  - "payments"     → 10 minutes  (payment writes evict immediately)
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
                                          ObjectMapper redisObjectMapper) {
        log.info("Initializing Redis Cache Manager — TTL: users(10m), reservations(2m), payments(10m) | No-TTL (evict-on-write): pcs, games, offers");
        RedisCacheConfiguration defaultConfig = buildCacheConfig(Duration.ofMinutes(10), redisObjectMapper);

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("users",        buildCacheConfig(Duration.ofMinutes(10), redisObjectMapper));
        cacheConfigs.put("reservations", buildCacheConfig(Duration.ofMinutes(2),  redisObjectMapper));
        cacheConfigs.put("pcs",          buildCacheConfig(Duration.ZERO, redisObjectMapper));
        cacheConfigs.put("games",        buildCacheConfig(Duration.ZERO, redisObjectMapper));
        cacheConfigs.put("offers",       buildCacheConfig(Duration.ZERO, redisObjectMapper));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
