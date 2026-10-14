package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies first-run behavior against an empty H2 schema using the same
 * Hibernate ddl-auto=update strategy used by the default deployment config.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("empty-db")
class EmptyDatabaseBehaviorTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void freshEmptySchemaCreatesTablesAndReturnsEmptyStudentData() throws Exception {
        String email = "fresh-" + UUID.randomUUID() + "@example.com";
        String registration = """
                {
                  "name": "Fresh Start Student",
                  "email": "%s",
                  "course": "Artificial Intelligence",
                  "password": "StrongPass123"
                }
                """.formatted(email);

        var registrationResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) registrationResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/tasks").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/subjects").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/study-sessions").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/coding-platforms").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/dashboard").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSubjects").value(0))
                .andExpect(jsonPath("$.totalTasks").value(0))
                .andExpect(jsonPath("$.completedTasks").value(0))
                .andExpect(jsonPath("$.pendingTasks").value(0))
                .andExpect(jsonPath("$.totalStudySessions").value(0))
                .andExpect(jsonPath("$.totalStudyMinutes").value(0));
    }
}
