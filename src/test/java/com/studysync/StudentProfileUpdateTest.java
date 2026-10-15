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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentProfileUpdateTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void updatingProfileToAnotherStudentsEmailReturnsConflict() throws Exception {
        var ownerRegistration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Profile Owner",
                                  "email": "profile-owner-update@example.com",
                                  "course": "AI",
                                  "password": "StrongPass123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession ownerSession =
                (MockHttpSession) ownerRegistration.getRequest().getSession(false);
        long ownerId = objectMapper
                .readTree(ownerRegistration.getResponse().getContentAsString())
                .path("id").asLong();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Other Student",
                                  "email": "profile-other-update@example.com",
                                  "course": "AI",
                                  "password": "StrongPass123"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/students/" + ownerId)
                        .session(ownerSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Profile Owner",
                                  "email": "PROFILE-OTHER-UPDATE@example.com",
                                  "course": "AI"
                                }
                                """))
                .andExpect(status().isConflict());
    }
}
