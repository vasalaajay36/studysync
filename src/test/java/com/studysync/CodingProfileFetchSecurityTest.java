package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodingProfileFetchSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void fetchingAProfileRequiresAnAuthenticatedSession() throws Exception {
        mockMvc.perform(post("/api/coding-platforms/fetch")
                        .param("platform", "LeetCode")
                        .param("username", "example"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unsupportedPlatformIsRejectedBeforeCallingAnExternalService() throws Exception {
        String registration = """
                {
                  "name": "Fetch Test Student",
                  "email": "fetch-security@example.com",
                  "course": "Artificial Intelligence",
                  "password": "StrongPass123"
                }
                """;

        var result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) result.getRequest().getSession(false);

        mockMvc.perform(post("/api/coding-platforms/fetch")
                        .session(session)
                        .param("platform", "UnknownPlatform")
                        .param("username", "example"))
                .andExpect(status().isBadRequest());
    }
}
