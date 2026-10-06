package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndOwnershipIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void protectedEndpointsRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/study-sessions"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/coding-platforms"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationCreatesSessionAndMeReturnsCurrentStudent() throws Exception {
        String registration = """
                {
                  "name": "Test Student",
                  "email": "auth-test@example.com",
                  "course": "Computer Science",
                  "password": "strongpass123"
                }
                """;

        var result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("auth-test@example.com"))
                .andReturn();

        var session = result.getRequest().getSession(false);
        if (session == null) {
            throw new AssertionError("Registration did not create an HTTP session");
        }

        mockMvc.perform(get("/api/auth/me").session((org.springframework.mock.web.MockHttpSession) session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Student"))
                .andExpect(jsonPath("$.email").value("auth-test@example.com"));
    }

    @Test
    void duplicateEmailIsRejectedCaseInsensitively() throws Exception {
        String first = """
                {
                  "name": "First Student",
                  "email": "duplicate@example.com",
                  "course": "AI",
                  "password": "strongpass123"
                }
                """;

        String second = """
                {
                  "name": "Second Student",
                  "email": "DUPLICATE@example.com",
                  "course": "AI",
                  "password": "strongpass456"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(first))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(second))
                .andExpect(status().isConflict());
    }

    @Test
    void studentCannotReadAnotherStudentsTask() throws Exception {
        String first = """
                {
                  "name": "Owner",
                  "email": "owner@example.com",
                  "course": "AI",
                  "password": "strongpass123"
                }
                """;

        String second = """
                {
                  "name": "Other",
                  "email": "other@example.com",
                  "course": "AI",
                  "password": "strongpass456"
                }
                """;

        var firstResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(first))
                .andExpect(status().isCreated())
                .andReturn();

        var firstSession = (org.springframework.mock.web.MockHttpSession)
                firstResult.getRequest().getSession(false);

        var task = """
                {
                  "title": "Private Task",
                  "description": "Ownership test",
                  "dueDate": "2026-12-31",
                  "priority": "HIGH",
                  "completed": false,
                  "studentId": 999999
                }
                """;

        var taskResult = mockMvc.perform(post("/api/tasks")
                        .session(firstSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(task))
                .andExpect(status().isOk())
                .andReturn();

        int taskId = com.fasterxml.jackson.databind.json.JsonMapper
                .builder()
                .build()
                .readTree(taskResult.getResponse().getContentAsString())
                .get("id")
                .asInt();

        var secondResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(second))
                .andExpect(status().isCreated())
                .andReturn();

        var secondSession = (org.springframework.mock.web.MockHttpSession)
                secondResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/tasks/" + taskId).session(secondSession))
                .andExpect(status().isForbidden());
    }
}
