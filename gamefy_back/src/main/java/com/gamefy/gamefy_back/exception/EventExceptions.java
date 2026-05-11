package com.gamefy.gamefy_back.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class EventExceptions {

    @Getter
    @AllArgsConstructor
    public static class EventNotFoundException extends RuntimeException {
        private final Integer eventId;

        @Override
        public String getMessage() {
            return "Event not found with id: " + eventId;
        }
    }

    @Getter
    @AllArgsConstructor
    public static class EventTimeException extends RuntimeException {
        private final String message;

        @Override
        public String getMessage() {
            return message;
        }
    }

    @Getter
    @AllArgsConstructor
    public static class UserAlreadyParticipantException extends RuntimeException {
        @Override
        public String getMessage() {
            return "User is already a participant of this event";
        }
    }

    @Getter
    @AllArgsConstructor
    public static class ParticipationNotFoundException extends RuntimeException {
        @Override
        public String getMessage() {
            return "Participation not found for this event";
        }
    }

    @Getter
    @AllArgsConstructor
    public static class ParticipantNotFoundException extends RuntimeException {
        private final Integer participantId;

        @Override
        public String getMessage() {
            return "Participant not found with id: " + participantId;
        }
    }
}
