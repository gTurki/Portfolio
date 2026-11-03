package com.example.portfolio.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(int status, String error, String message, Map<String, String> fieldErrors,
                       LocalDateTime timestamp) {

    public static ApiError of(int status, String error, String message, Map<String, String> fieldErrors) {
        return new ApiError(status, error, message, fieldErrors, LocalDateTime.now());
    }
}
