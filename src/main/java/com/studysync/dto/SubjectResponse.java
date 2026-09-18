package com.studysync.dto;

public class SubjectResponse {

    private Long id;
    private String name;
    private String description;
    private Long studentId;

    public SubjectResponse() {
    }

    public SubjectResponse(
            Long id,
            String name,
            String description,
            Long studentId) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.studentId = studentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}