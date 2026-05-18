package com.gamefy.gamefy_back;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")  // uses application-test.properties (H2 + no Redis)
class GamefyBackApplicationTests {

    @Test
    void contextLoads() {
    }

}
