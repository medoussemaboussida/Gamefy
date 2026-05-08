package com.gamefy.gamefy_back.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class GameExceptions {

    @Getter
    @AllArgsConstructor
    public static class GameNotFoundException extends RuntimeException {
        private final String gameIdentifier;

        @Override
        public String getMessage() {
            return "PC Game not found: " + gameIdentifier;
        }
    }

    @Getter
    @AllArgsConstructor
    public static class GameAlreadyExistsException extends RuntimeException {
        private final String gameName;

        @Override
        public String getMessage() {
            return "Game with name '" + gameName + "' already exists";
        }
    }
}
