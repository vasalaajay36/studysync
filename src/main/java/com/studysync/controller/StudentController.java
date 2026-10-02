package com.studysync.controller;

import com.studysync.dto.StudentRequest;
import com.studysync.dto.StudentResponse;
import com.studysync.service.StudentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Student listings are scoped to the authenticated account; this endpoint no longer
    // exposes every student's private email and course to anonymous callers.
    @GetMapping
    public List<StudentResponse> getCurrentStudent(HttpSession session) {
        return List.of(studentService.getStudentById(AuthController.authenticatedStudentId(session)));
    }

    @GetMapping("/{id}")
    public StudentResponse getStudentById(@PathVariable Long id, HttpSession session) {
        requireOwner(id, session);
        return studentService.getStudentById(id);
    }

    @PostMapping
    public StudentResponse createStudent(@Valid @RequestBody StudentRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                "Use POST /api/auth/register to create an account");
    }

    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable Long id,
                                         @Valid @RequestBody StudentRequest request,
                                         HttpSession session) {
        requireOwner(id, session);
        return studentService.updateStudent(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable Long id, HttpSession session) {
        requireOwner(id, session);
        studentService.deleteStudent(id);
        session.invalidate();
    }

    private void requireOwner(Long requestedId, HttpSession session) {
        if (!requestedId.equals(AuthController.authenticatedStudentId(session))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another student's account");
        }
    }
}
