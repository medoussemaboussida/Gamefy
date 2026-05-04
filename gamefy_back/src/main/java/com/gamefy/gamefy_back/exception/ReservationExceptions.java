package com.gamefy.gamefy_back.exception;

public class ReservationExceptions {

    /** Thrown when a reservation cannot be found by its ID. */
    public static class ReservationNotFoundException extends RuntimeException {
        public ReservationNotFoundException(Integer id) {
            super("Reservation not found with id: " + id);
        }

        public ReservationNotFoundException() {
            super("Reservation not found");
        }
    }

    /** Thrown when a user tries to act on a reservation they don't own. */
    public static class ReservationAccessDeniedException extends RuntimeException {
        public ReservationAccessDeniedException() {
            super("This reservation does not belong to you");
        }
    }

    /** Thrown when reservation state/status prevents the requested operation. */
    public static class InvalidReservationStateException extends RuntimeException {
        public InvalidReservationStateException(String message) {
            super(message);
        }
    }

    /** Thrown when a PC fails validation (unavailable, wrong type, already booked, missing game). */
    public static class PcNotAvailableException extends RuntimeException {
        public PcNotAvailableException(String message) {
            super(message);
        }
    }

    /** Thrown when a coach is missing or not available for the requested session. */
    public static class CoachNotAvailableException extends RuntimeException {
        public CoachNotAvailableException(String message) {
            super(message);
        }
    }

    /** Thrown for invalid input data (missing fields, conflicting packs, unsupported types). */
    public static class InvalidReservationDataException extends RuntimeException {
        public InvalidReservationDataException(String message) {
            super(message);
        }
    }
}
