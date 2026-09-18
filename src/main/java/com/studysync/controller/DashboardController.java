package com.studysync.controller;

import com.studysync.dto.DashboardResponse;
import com.studysync.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{studentId}")
    public DashboardResponse getDashboard(
            @PathVariable Long studentId) {

        return dashboardService.getDashboard(studentId);
    }
}