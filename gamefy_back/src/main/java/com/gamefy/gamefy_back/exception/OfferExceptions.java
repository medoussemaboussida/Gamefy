package com.gamefy.gamefy_back.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class OfferExceptions {

    @Getter
    @AllArgsConstructor
    public static class OfferNotFoundException extends RuntimeException {
        private final Integer offerId;

        @Override
        public String getMessage() {
            return "Offer not found with id: " + offerId;
        }
    }
}
