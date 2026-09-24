package com.studysync.controller;

import com.studysync.dto.StudySessionRequest;
import com.studysync.dto.StudySessionResponse;
import com.studysync.service.StudySessionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    @GetMapping
    public List<StudySessionResponse> getAllSessions(HttpSession session) {
        return studySessionService.getSessionsByStudentId(AuthController.authenticatedStudentId(session));
    }

    @GetMapping("/{id}")
    public StudySessionResponse getSessionById(@PathVariable Long id, HttpSession session) {
        StudySessionResponse response = studySessionService.getSessionById(id);
        requireOwner(response.getStudentId(), session);
        return response;
    }

    @PostMapping
    public StudySessionResponse createSession(@Valid @RequestBody StudySessionRequest request,
                                              HttpSession session) {
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return studySessionService.createSession(request);
    }

    @PutMapping("/{id}")
    public StudySessionResponse updateSession(@PathVariable Long id,
                                              @Valid @RequestBody StudySessionRequest request,
                                              HttpSession session) {
        requireOwner(studySessionService.getSessionById(id).getStudentId(), session);
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return studySessionService.updateSession(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(@PathVariable Long id, HttpSession session) {
        requireOwner(studySessionService.getSessionById(id).getStudentId(), session);
        studySessionService.deleteSession(id);
    }

    @GetMapping("/student/{studentId}")
    public List<StudySessionResponse> getSessionsByStudentId(@PathVariable Long studentId,
                                                             HttpSession session) {
        requireOwner(studentId, session);
        return studySessionService.getSessionsByStudentId(studentId);
    }

    private void requireOwner(Long ownerId, HttpSession session) {
        if (!ownerId.equals(AuthController.authenticatedStudentId(session))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another student's study session");
        }
    }
}
