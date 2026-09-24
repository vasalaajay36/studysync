package com.studysync.controller;

import com.studysync.dto.DashboardResponse;
import com.studysync.service.DashboardService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"", "/{studentId}"})
    public DashboardResponse getDashboard(@PathVariable(required = false) Long studentId,
                                          HttpSession session) {
        Long authenticatedId = AuthController.authenticatedStudentId(session);
        if (studentId != null && !authenticatedId.equals(studentId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You cannot access another student's dashboard");
        }
        return dashboardService.getDashboard(authenticatedId);
    }
}
