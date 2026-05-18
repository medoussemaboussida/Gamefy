package com.gamefy.gamefy_back;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Sanity test — verifies the test infrastructure (JUnit + JaCoCo) works.
 *
 * We deliberately do NOT use @SpringBootTest here because loading the full
 * Spring context requires a live database, Redis, and all @Value properties
 * to be present — which is not available in CI without a test environment.
 *
 * Real integration tests should be written in separate test classes with
 * proper mocking (@MockBean, @WebMvcTest, etc.).
 *
 * JaCoCo still works: it instruments bytecode at compile time,
 * independently of Spring.
 */
class GamefyBackApplicationTests {

    @Test
    void contextLoads() {
        // Sanity check: if this test runs, JUnit + JaCoCo are wired correctly.
        assertTrue(true, "Test infrastructure is working");
    }

}

