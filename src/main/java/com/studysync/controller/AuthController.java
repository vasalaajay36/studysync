package com.studysync.controller;

import com.studysync.dto.AuthRequest;
import com.studysync.dto.RegisterRequest;
import com.studysync.dto.StudentResponse;
import com.studysync.entity.Student;
import com.studysync.repository.StudentRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public static final String SESSION_STUDENT_ID = "STUDYSYNC_STUDENT_ID";
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder(12);

    private final StudentRepository studentRepository;

    public AuthController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        String email = request.getEmail().trim().toLowerCase();
        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Student student = new Student();
        student.setName(request.getName().trim());
        student.setEmail(email);
        student.setCourse(request.getCourse().trim());
        student.setPasswordHash(PASSWORD_ENCODER.encode(request.getPassword()));
        Student saved = studentRepository.save(student);
        startSession(session, saved.getId());
        return toResponse(saved);
    }

    @PostMapping("/login")
    public StudentResponse login(@Valid @RequestBody AuthRequest request, HttpSession session) {
        Student student = studentRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        // Old records created before password authentication have no hash and must not be
        // silently accessible by email alone.
        if (student.getPasswordHash() == null
                || !PASSWORD_ENCODER.matches(request.getPassword(), student.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        startSession(session, student.getId());
        return toResponse(student);
    }

    @GetMapping("/me")
    public StudentResponse me(HttpSession session) {
        Long studentId = authenticatedStudentId(session);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated student no longer exists"));
        return toResponse(student);
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

    private void startSession(HttpSession session, Long studentId) {
        session.setAttribute(SESSION_STUDENT_ID, studentId);
        try {
            session.getClass().getMethod("getId");
        } catch (Exception ignored) {
            // Container manages session identifiers; the authentication state remains server-side.
        }
        session.setMaxInactiveInterval(60 * 60 * 8);
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(student.getId(), student.getName(), student.getEmail(), student.getCourse());
    }
}
