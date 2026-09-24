package com.studysync.service;

import com.studysync.dto.StudentRequest;
import com.studysync.dto.StudentResponse;
import com.studysync.entity.Student;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.StudySessionRepository;
import com.studysync.repository.SubjectRepository;
import com.studysync.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TaskRepository taskRepository;
    private final StudySessionRepository studySessionRepository;

    public StudentService(StudentRepository studentRepository,
                          SubjectRepository subjectRepository,
                          TaskRepository taskRepository,
                          StudySessionRepository studySessionRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.taskRepository = taskRepository;
        this.studySessionRepository = studySessionRepository;
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(student -> new StudentResponse(student.getId(), student.getName(), student.getEmail(), student.getCourse()))
                .toList();
    }

    public StudentResponse createStudent(StudentRequest request) {
        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setCourse(request.getCourse());
        return toResponse(studentRepository.save(student));
    }

    public StudentResponse getStudentById(Long id) {
        return toResponse(studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id)));
    }

    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setCourse(request.getCourse());
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));

        studySessionRepository.deleteByStudentId(id);
        taskRepository.deleteByStudentId(id);
        subjectRepository.deleteByStudentId(id);
        studentRepository.deleteById(id);
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(student.getId(), student.getName(), student.getEmail(), student.getCourse());
    }
}
