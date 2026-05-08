package com.gamefy.gamefy_back.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class PcExceptions {

    @Getter
    @AllArgsConstructor
    public static class PcNotFoundException extends RuntimeException {
        private final Integer pcId;

        @Override
        public String getMessage() {
            return "PC not found with id: " + pcId;
        }
    }
}
