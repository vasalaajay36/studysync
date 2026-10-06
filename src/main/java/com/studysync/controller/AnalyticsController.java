package com.studysync.controller;

import com.studysync.dto.AnalyticsResponse;
import com.studysync.service.AnalyticsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public AnalyticsResponse getAnalytics(
            @RequestParam(defaultValue = "7") int days,
            HttpSession session) {
        return analyticsService.getAnalytics(
                AuthController.authenticatedStudentId(session),
                days
        );
    }
}
