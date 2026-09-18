package com.studysync.dto;

public class DashboardResponse {

    private Long studentId;
    private String studentName;

    private long totalSubjects;

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;

    private long totalStudySessions;
    private long totalStudyMinutes;

    public DashboardResponse() {
    }

    public DashboardResponse(
            Long studentId,
            String studentName,
            long totalSubjects,
            long totalTasks,
            long completedTasks,
            long pendingTasks,
            long totalStudySessions,
            long totalStudyMinutes) {

        this.studentId = studentId;
        this.studentName = studentName;
        this.totalSubjects = totalSubjects;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.pendingTasks = pendingTasks;
        this.totalStudySessions = totalStudySessions;
        this.totalStudyMinutes = totalStudyMinutes;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getTotalStudySessions() {
        return totalStudySessions;
    }

    public void setTotalStudySessions(long totalStudySessions) {
        this.totalStudySessions = totalStudySessions;
    }

    public long getTotalStudyMinutes() {
        return totalStudyMinutes;
    }

    public void setTotalStudyMinutes(long totalStudyMinutes) {
        this.totalStudyMinutes = totalStudyMinutes;
    }
}