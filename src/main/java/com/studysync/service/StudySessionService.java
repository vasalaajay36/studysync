package com.studysync.service;

import com.studysync.dto.StudySessionRequest;
import com.studysync.dto.StudySessionResponse;
import com.studysync.entity.Student;
import com.studysync.entity.StudySession;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.exception.StudySessionNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final StudentRepository studentRepository;

    public StudySessionService(StudySessionRepository studySessionRepository,
                               StudentRepository studentRepository) {
        this.studySessionRepository = studySessionRepository;
        this.studentRepository = studentRepository;
    }

    public List<StudySessionResponse> getAllSessions() {
        return studySessionRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    public StudySessionResponse createSession(StudySessionRequest request) {
        Student student = getStudent(request.getStudentId());
        StudySession session = new StudySession();
        apply(session, request, student);
        return convertToResponse(studySessionRepository.save(session));
    }

    public StudySessionResponse getSessionById(Long id) {
        return convertToResponse(studySessionRepository.findById(id)
                .orElseThrow(() -> new StudySessionNotFoundException(id)));
    }

    public StudySessionResponse updateSession(Long id, StudySessionRequest request) {
        StudySession existing = studySessionRepository.findById(id)
                .orElseThrow(() -> new StudySessionNotFoundException(id));
        apply(existing, request, getStudent(request.getStudentId()));
        return convertToResponse(studySessionRepository.save(existing));
    }

    public void deleteSession(Long id) {
        StudySession session = studySessionRepository.findById(id)
                .orElseThrow(() -> new StudySessionNotFoundException(id));
        studySessionRepository.delete(session);
    }

    public List<StudySessionResponse> getSessionsByStudentId(Long studentId) {
        getStudent(studentId);
        return studySessionRepository.findByStudentId(studentId).stream()
                .map(this::convertToResponse)
                .toList();
    }

    private Student getStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));
    }

    private void apply(StudySession session, StudySessionRequest request, Student student) {
        session.setTopic(request.getTopic());
        session.setDescription(request.getDescription());
        session.setDate(request.getDate());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCompleted(request.getCompleted());
        session.setStudent(student);
    }

    private StudySessionResponse convertToResponse(StudySession session) {
        return new StudySessionResponse(
                session.getId(),
                session.getTopic(),
                session.getDescription(),
                session.getDate(),
                session.getDurationMinutes(),
                session.isCompleted(),
                session.getStudent().getId());
    }
}
