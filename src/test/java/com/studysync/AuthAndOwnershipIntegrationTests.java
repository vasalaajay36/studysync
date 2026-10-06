package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import static org.springframework.test.util.AssertionErrors.fail;

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

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        if (session == null) {
            fail("Registration did not create an HTTP session");
        }

        mockMvc.perform(get("/api/auth/me").session(session))
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

        MockHttpSession firstSession = (MockHttpSession) firstResult.getRequest().getSession(false);
        if (firstSession == null) {
            fail("First registration did not create an HTTP session");
        }

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

        String taskResponse = taskResult.getResponse().getContentAsString();
        int taskId = Integer.parseInt(
                taskResponse.replaceAll(".*\"id\"\\s*:\\s*(\\d+).*", "$1")
        );

        var secondResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(second))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession secondSession = (MockHttpSession) secondResult.getRequest().getSession(false);
        if (secondSession == null) {
            fail("Second registration did not create an HTTP session");
        }

        mockMvc.perform(get("/api/tasks/" + taskId).session(secondSession))
                .andExpect(status().isForbidden());
    }
}
