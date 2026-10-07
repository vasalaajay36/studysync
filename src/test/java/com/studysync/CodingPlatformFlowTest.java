package com.studysync;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodingPlatformFlowTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void authenticatedStudentCanCreateListAndDeleteCodingProfile() throws Exception {
        String registration = """
                {
                  "name": "Coding Student",
                  "email": "coding-flow@example.com",
                  "course": "AI",
                  "password": "StrongPass123"
                }
                """;

        var registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) registerResult.getRequest().getSession(false);

        String profile = """
                {
                  "name": "LeetCode",
                  "url": "https://leetcode.com/u/testuser/",
                  "username": "testuser",
                  "problemsSolved": 120,
                  "rating": 1500,
                  "globalRank": 50000,
                  "contestsParticipated": 10,
                  "highestRating": 1600,
                  "streak": 7,
                  "platformRank": 50000
                }
                """;

        var createResult = mockMvc.perform(post("/api/coding-platforms")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("LeetCode"))
                .andExpect(jsonPath("$.problemsSolved").value(120))
                .andReturn();

        String response = createResult.getResponse().getContentAsString();
        long id = objectMapper.readTree(response).path("id").asLong();

        mockMvc.perform(get("/api/coding-platforms").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testuser"));

        mockMvc.perform(delete("/api/coding-platforms/" + id).session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/coding-platforms").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
