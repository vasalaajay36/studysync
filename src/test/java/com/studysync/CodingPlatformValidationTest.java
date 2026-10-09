package com.studysync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodingPlatformValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void negativeCodingStatisticsAreRejected() throws Exception {
        MockHttpSession session = register("negative-stats@example.com", "Negative Stats");

        String profile = """
                {
                  "name": "LeetCode",
                  "username": "negativeuser",
                  "problemsSolved": -1,
                  "rating": 0,
                  "globalRank": 0,
                  "contestsParticipated": 0,
                  "highestRating": 0,
                  "streak": 0,
                  "platformRank": 0
                }
                """;

        mockMvc.perform(post("/api/coding-platforms")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void duplicatePlatformIsRejectedAndProfilesAreIsolatedPerStudent() throws Exception {
        MockHttpSession ownerSession = register("profile-isolation-owner@example.com", "Profile Owner");
        MockHttpSession otherSession = register("profile-isolation-other@example.com", "Other Student");

        String profile = """
                {
                  "name": "Codeforces",
                  "username": "isolationuser",
                  "problemsSolved": 10,
                  "rating": 1000,
                  "globalRank": 0,
                  "contestsParticipated": 1,
                  "highestRating": 1000,
                  "streak": 0,
                  "platformRank": 0
                }
                """;

        mockMvc.perform(post("/api/coding-platforms")
                        .session(ownerSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/coding-platforms")
                        .session(ownerSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(get("/api/coding-platforms").session(otherSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/coding-platforms").session(ownerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("isolationuser"));
    }

    private MockHttpSession register(String email, String name) throws Exception {
        String body = """
                {
                  "name": "%s",
                  "email": "%s",
                  "course": "Artificial Intelligence",
                  "password": "StrongPass123"
                }
                """.formatted(name, email);

        var result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }
}
