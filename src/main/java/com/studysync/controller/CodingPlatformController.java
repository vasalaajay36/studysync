package com.studysync.controller;

import com.studysync.dto.CodingPlatformRequest;
import com.studysync.dto.CodingPlatformResponse;
import com.studysync.service.CodingPlatformService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding-platforms")
public class CodingPlatformController {

    private final CodingPlatformService service;

    public CodingPlatformController(CodingPlatformService service) {
        this.service = service;
    }

    @GetMapping
    public List<CodingPlatformResponse> getAll(HttpSession session) {
        return service.getAll(AuthController.authenticatedStudentId(session));
    }

    @PostMapping
    public CodingPlatformResponse create(@Valid @RequestBody CodingPlatformRequest request,
                                         HttpSession session) {
        return service.create(request, AuthController.authenticatedStudentId(session));
    }

    @PutMapping("/{id}")
    public CodingPlatformResponse update(@PathVariable Long id,
                                         @Valid @RequestBody CodingPlatformRequest request,
                                         HttpSession session) {
        return service.update(id, request, AuthController.authenticatedStudentId(session));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpSession session) {
        service.delete(id, AuthController.authenticatedStudentId(session));
    }

    @PostMapping("/fetch")
    public CodingPlatformResponse fetchProfile(@RequestParam String platform,
                                               @RequestParam String username,
                                               HttpSession session) {
        AuthController.authenticatedStudentId(session);
        return service.fetchProfile(platform, username);
    }
}
