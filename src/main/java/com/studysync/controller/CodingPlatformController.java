package com.studysync.controller;

import com.studysync.dto.CodingPlatformRequest;
import com.studysync.dto.CodingPlatformResponse;
import com.studysync.service.CodingPlatformService;
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
    public List<CodingPlatformResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CodingPlatformResponse create(@Valid @RequestBody CodingPlatformRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CodingPlatformResponse update(@PathVariable Long id,
                                         @Valid @RequestBody CodingPlatformRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/fetch")
    public CodingPlatformResponse fetchProfile(@RequestParam String platform,
                                               @RequestParam String username) {
        return service.fetchProfile(platform, username);
    }
}
