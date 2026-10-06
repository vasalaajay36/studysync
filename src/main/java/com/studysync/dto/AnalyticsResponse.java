package com.studysync.dto;

import java.util.List;

public class AnalyticsResponse {
    private int periodDays;
    private long totalStudyMinutes;
    private long totalStudySessions;
    private long completedStudySessions;
    private long studyDays;
    private double taskCompletionRate;
    private List<DailyStudyPoint> dailyStudy;
    private List<TopicStudyPoint> topTopics;

    public AnalyticsResponse() {}

    public AnalyticsResponse(int periodDays, long totalStudyMinutes, long totalStudySessions,
                             long completedStudySessions, long studyDays, double taskCompletionRate,
                             List<DailyStudyPoint> dailyStudy, List<TopicStudyPoint> topTopics) {
        this.periodDays = periodDays;
        this.totalStudyMinutes = totalStudyMinutes;
        this.totalStudySessions = totalStudySessions;
        this.completedStudySessions = completedStudySessions;
        this.studyDays = studyDays;
        this.taskCompletionRate = taskCompletionRate;
        this.dailyStudy = dailyStudy;
        this.topTopics = topTopics;
    }

    public int getPeriodDays() { return periodDays; }
    public void setPeriodDays(int periodDays) { this.periodDays = periodDays; }
    public long getTotalStudyMinutes() { return totalStudyMinutes; }
    public void setTotalStudyMinutes(long totalStudyMinutes) { this.totalStudyMinutes = totalStudyMinutes; }
    public long getTotalStudySessions() { return totalStudySessions; }
    public void setTotalStudySessions(long totalStudySessions) { this.totalStudySessions = totalStudySessions; }
    public long getCompletedStudySessions() { return completedStudySessions; }
    public void setCompletedStudySessions(long completedStudySessions) { this.completedStudySessions = completedStudySessions; }
    public long getStudyDays() { return studyDays; }
    public void setStudyDays(long studyDays) { this.studyDays = studyDays; }
    public double getTaskCompletionRate() { return taskCompletionRate; }
    public void setTaskCompletionRate(double taskCompletionRate) { this.taskCompletionRate = taskCompletionRate; }
    public List<DailyStudyPoint> getDailyStudy() { return dailyStudy; }
    public void setDailyStudy(List<DailyStudyPoint> dailyStudy) { this.dailyStudy = dailyStudy; }
    public List<TopicStudyPoint> getTopTopics() { return topTopics; }
    public void setTopTopics(List<TopicStudyPoint> topTopics) { this.topTopics = topTopics; }

    public static class DailyStudyPoint {
        private String date;
        private long minutes;
        public DailyStudyPoint() {}
        public DailyStudyPoint(String date, long minutes) { this.date = date; this.minutes = minutes; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getMinutes() { return minutes; }
        public void setMinutes(long minutes) { this.minutes = minutes; }
    }

    public static class TopicStudyPoint {
        private String topic;
        private long minutes;
        public TopicStudyPoint() {}
        public TopicStudyPoint(String topic, long minutes) { this.topic = topic; this.minutes = minutes; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public long getMinutes() { return minutes; }
        public void setMinutes(long minutes) { this.minutes = minutes; }
    }
}
