package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerLoginMeLogoutFlowWorks() throws Exception {
        String registration = """
                {
                  "name": "Test Student",
                  "email": "auth-flow@example.com",
                  "course": "Artificial Intelligence",
                  "password": "StrongPass123"
                }
                """;

        var registrationResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("auth-flow@example.com"))
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) registrationResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Student"));

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateEmailIsRejected() throws Exception {
        String registration = """
                {
                  "name": "First Student",
                  "email": "duplicate-auth-flow@example.com",
                  "course": "AI",
                  "password": "StrongPass123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isConflict());
    }

    @Test
    void protectedEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/coding-platforms"))
                .andExpect(status().isUnauthorized());
    }
}
