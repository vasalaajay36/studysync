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

    public StudySessionService(
            StudySessionRepository studySessionRepository,
            StudentRepository studentRepository) {

        this.studySessionRepository = studySessionRepository;
        this.studentRepository = studentRepository;
    }

    public List<StudySessionResponse> getAllSessions() {

        return studySessionRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public StudySessionResponse createSession(StudySessionRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        StudySession session = new StudySession();

        session.setTopic(request.getTopic());
        session.setDate(request.getDate());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setStudent(student);

        StudySession savedSession = studySessionRepository.save(session);

        return convertToResponse(savedSession);
    }

    public StudySessionResponse getSessionById(Long id) {

        StudySession session = studySessionRepository.findById(id)
                .orElseThrow(() ->
                        new StudySessionNotFoundException(id));

        return convertToResponse(session);
    }

    public StudySessionResponse updateSession(
            Long id,
            StudySessionRequest request) {

        StudySession existingSession =
                studySessionRepository.findById(id)
                        .orElseThrow(() ->
                                new StudySessionNotFoundException(id));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        existingSession.setTopic(request.getTopic());
        existingSession.setDate(request.getDate());
        existingSession.setDurationMinutes(request.getDurationMinutes());
        existingSession.setStudent(student);

        StudySession updatedSession =
                studySessionRepository.save(existingSession);

        return convertToResponse(updatedSession);
    }

    public void deleteSession(Long id) {

        StudySession session =
                studySessionRepository.findById(id)
                        .orElseThrow(() ->
                                new StudySessionNotFoundException(id));

        studySessionRepository.delete(session);
    }

    public List<StudySessionResponse> getSessionsByStudentId(Long studentId) {

        studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new StudentNotFoundException(studentId));

        return studySessionRepository.findByStudentId(studentId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private StudySessionResponse convertToResponse(StudySession session) {

        return new StudySessionResponse(
                session.getId(),
                session.getTopic(),
                session.getDate(),
                session.getDurationMinutes(),
                session.getStudent().getId()
        );
    }
}