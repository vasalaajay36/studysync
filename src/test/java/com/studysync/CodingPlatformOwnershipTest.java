package com.studysync;

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
class CodingPlatformOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void studentCannotUpdateOrDeleteAnotherStudentsCodingProfile() throws Exception {
        MockHttpSession ownerSession = register("profile-owner@example.com", "Profile Owner");
        MockHttpSession otherSession = register("profile-other@example.com", "Other Student");

        String profile = """
                {
                  "name": "LeetCode",
                  "url": "https://leetcode.com/u/profileowner/",
                  "username": "profileowner",
                  "problemsSolved": 50,
                  "rating": 1200,
                  "globalRank": 1000,
                  "contestsParticipated": 5,
                  "highestRating": 1250,
                  "streak": 3,
                  "platformRank": 1000
                }
                """;

        var created = mockMvc.perform(post("/api/coding-platforms")
                        .session(ownerSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile))
                .andExpect(status().isOk())
                .andReturn();

        long profileId = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(created.getResponse().getContentAsString())
                .path("id").asLong();

        mockMvc.perform(delete("/api/coding-platforms/" + profileId)
                        .session(otherSession))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/coding-platforms/" + profileId)
                        .session(otherSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile.replace("profileowner", "otherstudent")))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/coding-platforms").session(ownerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("profileowner"));
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
