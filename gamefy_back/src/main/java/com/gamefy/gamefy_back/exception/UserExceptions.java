package com.gamefy.gamefy_back.exception;

import com.gamefy.gamefy_back.model.enums.Roles;

public class UserExceptions {

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(Integer id) {
            super("User not found with id: " + id);
        }

        public UserNotFoundException(String message) {
            super(message);
        }
    }

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String email) {
            super("Email already exists: " + email);
        }
    }

    public static class InvalidRoleException extends RuntimeException {
        public InvalidRoleException(Roles role) {
            super("Invalid role assignment: " + role + ". Only ADMIN or WEB_MASTER roles can be assigned.");
        }
    }

    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }

    public static class RecaptchaException extends RuntimeException {
        public RecaptchaException(String message) {
            super(message);
        }
    }
}
