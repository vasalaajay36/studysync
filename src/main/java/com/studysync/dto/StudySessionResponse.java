package com.studysync.dto;

import java.time.LocalDate;

public class StudySessionResponse {

    private Long id;
    private String topic;
    private LocalDate date;
    private Integer durationMinutes;
    private Long studentId;

    public StudySessionResponse() {
    }

    public StudySessionResponse(
            Long id,
            String topic,
            LocalDate date,
            Integer durationMinutes,
            Long studentId) {

        this.id = id;
        this.topic = topic;
        this.date = date;
        this.durationMinutes = durationMinutes;
        this.studentId = studentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}