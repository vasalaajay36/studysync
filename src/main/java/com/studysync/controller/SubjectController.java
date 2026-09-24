package com.studysync.controller;

import com.studysync.dto.SubjectRequest;
import com.studysync.dto.SubjectResponse;
import com.studysync.service.SubjectService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public List<SubjectResponse> getAllSubjects(HttpSession session) {
        return subjectService.getSubjectsByStudentId(AuthController.authenticatedStudentId(session));
    }

    @GetMapping("/{id}")
    public SubjectResponse getSubjectById(@PathVariable Long id, HttpSession session) {
        SubjectResponse response = subjectService.getSubjectById(id);
        requireOwner(response.getStudentId(), session);
        return response;
    }

    @PostMapping
    public SubjectResponse createSubject(@Valid @RequestBody SubjectRequest request,
                                         HttpSession session) {
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return subjectService.createSubject(request);
    }

    @PutMapping("/{id}")
    public SubjectResponse updateSubject(@PathVariable Long id,
                                         @Valid @RequestBody SubjectRequest request,
                                         HttpSession session) {
        requireOwner(subjectService.getSubjectById(id).getStudentId(), session);
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return subjectService.updateSubject(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSubject(@PathVariable Long id, HttpSession session) {
        requireOwner(subjectService.getSubjectById(id).getStudentId(), session);
        subjectService.deleteSubject(id);
    }

    @GetMapping("/student/{studentId}")
    public List<SubjectResponse> getSubjectsByStudentId(@PathVariable Long studentId,
                                                       HttpSession session) {
        requireOwner(studentId, session);
        return subjectService.getSubjectsByStudentId(studentId);
    }

    private void requireOwner(Long ownerId, HttpSession session) {
        if (!ownerId.equals(AuthController.authenticatedStudentId(session))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another student's subject");
        }
    }
}
