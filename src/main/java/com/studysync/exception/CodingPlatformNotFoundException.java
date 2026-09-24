package com.studysync.exception;

public class CodingPlatformNotFoundException extends RuntimeException {
    public CodingPlatformNotFoundException(Long id) {
        super("Coding platform not found with id: " + id);
    }
}
