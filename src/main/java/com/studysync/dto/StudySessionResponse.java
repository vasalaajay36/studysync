package com.studysync.dto;

import java.time.LocalDate;

public class StudySessionResponse {

    private Long id;
    private String topic;
    private String description;
    private LocalDate date;
    private Integer durationMinutes;
    private boolean completed;
    private Long studentId;

    public StudySessionResponse() {}

    public StudySessionResponse(Long id, String topic, String description,
                                LocalDate date, Integer durationMinutes,
                                boolean completed, Long studentId) {
        this.id = id;
        this.topic = topic;
        this.description = description;
        this.date = date;
        this.durationMinutes = durationMinutes;
        this.completed = completed;
        this.studentId = studentId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
}
