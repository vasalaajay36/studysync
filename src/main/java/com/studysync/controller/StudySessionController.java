package com.studysync.controller;

import com.studysync.dto.StudySessionRequest;
import com.studysync.dto.StudySessionResponse;
import com.studysync.service.StudySessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(
            StudySessionService studySessionService) {

        this.studySessionService = studySessionService;
    }

    @GetMapping
    public List<StudySessionResponse> getAllSessions() {
        return studySessionService.getAllSessions();
    }

    @GetMapping("/{id}")
    public StudySessionResponse getSessionById(
            @PathVariable Long id) {

        return studySessionService.getSessionById(id);
    }

    @PostMapping
    public StudySessionResponse createSession(
            @Valid @RequestBody StudySessionRequest request) {

        return studySessionService.createSession(request);
    }

    @PutMapping("/{id}")
    public StudySessionResponse updateSession(
            @PathVariable Long id,
            @Valid @RequestBody StudySessionRequest request) {

        return studySessionService.updateSession(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        studySessionService.deleteSession(id);
    }

    @GetMapping("/student/{studentId}")
    public List<StudySessionResponse> getSessionsByStudentId(
            @PathVariable Long studentId) {

        return studySessionService.getSessionsByStudentId(studentId);
    }
}