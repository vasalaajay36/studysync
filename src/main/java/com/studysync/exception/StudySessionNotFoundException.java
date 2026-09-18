package com.studysync.exception;

public class StudySessionNotFoundException extends RuntimeException {

    public StudySessionNotFoundException(Long id) {
        super("Study session not found with id: " + id);
    }
}