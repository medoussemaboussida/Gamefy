package com.gamefy.gamefy_back.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
public class RedisConfig {

    /**
     * Base cache configuration:
     *  - Keys → plain String serializer
     *  - Values → JSON via RedisSerializer.json() (Spring Data Redis built-in,
     *    no extra Jackson dependency needed)
     *  - Null values are never cached
     */
    private RedisCacheConfiguration buildCacheConfig(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(RedisSerializer.java())   // Java serialization — reliable, works with all DTOs
                );
    }

    /**
     * RedisCacheManager with per-cache TTLs:
     *  - "users"        → 10 minutes  (admin write actions evict immediately)
     *  - "reservations" → 2 minutes   (front-office bookings are frequent)
     *  - "payments"     → 10 minutes  (payment writes evict immediately)
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("Initializing Redis Cache Manager with per-cache TTLs: users(10m), reservations(2m), payments(10m)");
        RedisCacheConfiguration defaultConfig = buildCacheConfig(Duration.ofMinutes(10));

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("users",        buildCacheConfig(Duration.ofMinutes(10)));
        cacheConfigs.put("reservations", buildCacheConfig(Duration.ofMinutes(2)));
        cacheConfigs.put("payments",     buildCacheConfig(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
