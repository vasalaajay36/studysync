package com.studysync.service;

import com.studysync.dto.SubjectRequest;
import com.studysync.dto.SubjectResponse;
import com.studysync.entity.Student;
import com.studysync.entity.Subject;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.exception.SubjectNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;

    public SubjectService(
            SubjectRepository subjectRepository,
            StudentRepository studentRepository) {

        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll()
                .stream()
                .map(subject -> new SubjectResponse(
                        subject.getId(),
                        subject.getName(),
                        subject.getDescription(),
                        subject.getStudent().getId()
                ))
                .toList();
    }

    public SubjectResponse createSubject(SubjectRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        Subject subject = new Subject();

        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject.setStudent(student);

        Subject savedSubject = subjectRepository.save(subject);

        return new SubjectResponse(
                savedSubject.getId(),
                savedSubject.getName(),
                savedSubject.getDescription(),
                savedStudentId(savedSubject)
        );
    }

    public SubjectResponse getSubjectById(Long id) {

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new SubjectNotFoundException(id));

        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getDescription(),
                subject.getStudent().getId()
        );
    }

    public SubjectResponse updateSubject(
            Long id,
            SubjectRequest request) {

        Subject existingSubject = subjectRepository.findById(id)
                .orElseThrow(() -> new SubjectNotFoundException(id));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        existingSubject.setName(request.getName());
        existingSubject.setDescription(request.getDescription());
        existingSubject.setStudent(student);

        Subject updatedSubject = subjectRepository.save(existingSubject);

        return new SubjectResponse(
                updatedSubject.getId(),
                updatedSubject.getName(),
                updatedSubject.getDescription(),
                updatedSubject.getStudent().getId()
        );
    }

    public void deleteSubject(Long id) {

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new SubjectNotFoundException(id));

        subjectRepository.delete(subject);
    }

    private Long savedStudentId(Subject subject) {
        return subject.getStudent().getId();
    }

        public List<SubjectResponse> getSubjectsByStudentId(Long studentId) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        return subjectRepository.findByStudentId(studentId)
                .stream()
                .map(subject -> new SubjectResponse(
                        subject.getId(),
                        subject.getName(),
                        subject.getDescription(),
                        subject.getStudent().getId()
                ))
                .toList();
        }
}