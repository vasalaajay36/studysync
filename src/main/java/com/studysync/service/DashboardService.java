package com.studysync.service;

import com.studysync.dto.DashboardResponse;
import com.studysync.entity.Student;
import com.studysync.entity.StudySession;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.SubjectRepository;
import com.studysync.repository.TaskRepository;
import com.studysync.repository.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TaskRepository taskRepository;
    private final StudySessionRepository studySessionRepository;

    public DashboardService(
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            TaskRepository taskRepository,
            StudySessionRepository studySessionRepository) {

        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.taskRepository = taskRepository;
        this.studySessionRepository = studySessionRepository;
    }

    public DashboardResponse getDashboard(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new StudentNotFoundException(studentId));

        long totalSubjects =
                subjectRepository.findByStudentId(studentId).size();

        var tasks = taskRepository.findByStudentId(studentId);

        long totalTasks = tasks.size();

        long completedTasks = tasks.stream()
                .filter(task -> task.isCompleted())
                .count();

        long pendingTasks = totalTasks - completedTasks;

        List<StudySession> sessions =
                studySessionRepository.findByStudentId(studentId);

        long totalStudySessions = sessions.size();

        long totalStudyMinutes = sessions.stream()
                .mapToLong(session -> session.getDurationMinutes())
                .sum();

        return new DashboardResponse(
                student.getId(),
                student.getName(),
                totalSubjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                totalStudySessions,
                totalStudyMinutes
        );
    }
}