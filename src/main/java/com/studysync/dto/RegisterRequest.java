package com.studysync.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Email
    @NotBlank
    @Size(max = 190)
    private String email;

    @NotBlank
    @Size(max = 100)
    private String course;

    @NotBlank
    @Size(min = 8, max = 72, message = "Password must contain between 8 and 72 characters")
    private String password;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
