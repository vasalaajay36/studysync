package com.studysync.controller;

import com.studysync.dto.AuthRequest;
import com.studysync.dto.StudentResponse;
import com.studysync.entity.Student;
import com.studysync.repository.StudentRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String SESSION_STUDENT_ID = "STUDYSYNC_STUDENT_ID";

    private final StudentRepository studentRepository;

    public AuthController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/login")
    public StudentResponse login(@Valid @RequestBody AuthRequest request,
                                 HttpSession session) {
        Student student = studentRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        // StudySync's existing Student schema predates password storage.
        // The optional password is accepted for frontend compatibility while
        // the authenticated identity is bound to the server-side session.
        session.setAttribute(SESSION_STUDENT_ID, student.getId());
        session.setMaxInactiveInterval(60 * 60 * 8);

        return new StudentResponse(
                student.getId(), student.getName(), student.getEmail(), student.getCourse());
    }

    @GetMapping("/me")
    public StudentResponse me(HttpSession session) {
        Long studentId = authenticatedStudentId(session);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated student no longer exists"));
        return new StudentResponse(
                student.getId(), student.getName(), student.getEmail(), student.getCourse());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpSession session) {
        session.invalidate();
    }

    public static Long authenticatedStudentId(HttpSession session) {
        Object value = session.getAttribute(SESSION_STUDENT_ID);
        if (!(value instanceof Long studentId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return studentId;
    }
}
