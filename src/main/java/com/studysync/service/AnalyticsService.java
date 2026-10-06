package com.studysync.service;

import com.studysync.dto.AnalyticsResponse;
import com.studysync.entity.StudySession;
import com.studysync.entity.Task;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.StudySessionRepository;
import com.studysync.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final StudentRepository studentRepository;
    private final StudySessionRepository studySessionRepository;
    private final TaskRepository taskRepository;

    public AnalyticsService(StudentRepository studentRepository,
                            StudySessionRepository studySessionRepository,
                            TaskRepository taskRepository) {
        this.studentRepository = studentRepository;
        this.studySessionRepository = studySessionRepository;
        this.taskRepository = taskRepository;
    }

    public AnalyticsResponse getAnalytics(Long studentId, int days) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(studentId);
        }

        int period = Math.max(7, Math.min(days, 30));
        LocalDate today = LocalDate.now(ZONE);
        LocalDate start = today.minusDays(period - 1L);

        List<StudySession> periodSessions = studySessionRepository.findByStudentId(studentId).stream()
                .filter(session -> session.getDate() != null
                        && !session.getDate().isBefore(start)
                        && !session.getDate().isAfter(today))
                .toList();

        List<StudySession> completedSessions = periodSessions.stream()
                .filter(StudySession::isCompleted)
                .toList();

        long totalMinutes = completedSessions.stream()
                .mapToLong(session -> session.getDurationMinutes() == null ? 0 : session.getDurationMinutes())
                .sum();

        Map<LocalDate, Long> dailyMap = completedSessions.stream()
                .collect(Collectors.groupingBy(
                        StudySession::getDate,
                        Collectors.summingLong(s -> s.getDurationMinutes() == null ? 0 : s.getDurationMinutes())
                ));

        List<AnalyticsResponse.DailyStudyPoint> dailyStudy = new ArrayList<>();
        for (int i = 0; i < period; i++) {
            LocalDate date = start.plusDays(i);
            dailyStudy.add(new AnalyticsResponse.DailyStudyPoint(
                    date.format(DATE_FORMAT),
                    dailyMap.getOrDefault(date, 0L)
            ));
        }

        Map<String, Long> topicMap = completedSessions.stream()
                .filter(s -> s.getTopic() != null && !s.getTopic().isBlank())
                .collect(Collectors.groupingBy(
                        s -> s.getTopic().trim(),
                        Collectors.summingLong(s -> s.getDurationMinutes() == null ? 0 : s.getDurationMinutes())
                ));

        List<AnalyticsResponse.TopicStudyPoint> topTopics = topicMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(e -> new AnalyticsResponse.TopicStudyPoint(e.getKey(), e.getValue()))
                .toList();

        long studyDays = dailyMap.keySet().size();
        List<Task> tasks = taskRepository.findByStudentId(studentId);
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        double taskRate = tasks.isEmpty() ? 0.0 : Math.round((completedTasks * 10000.0 / tasks.size())) / 100.0;

        return new AnalyticsResponse(
                period,
                totalMinutes,
                periodSessions.size(),
                completedSessions.size(),
                studyDays,
                taskRate,
                dailyStudy,
                topTopics
        );
    }
}
