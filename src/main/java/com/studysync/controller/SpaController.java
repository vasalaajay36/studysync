package com.studysync.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({"/dashboard", "/tasks", "/subjects", "/study-sessions", "/coding-platforms"})
    public String forwardToReactApplication() {
        return "forward:/index.html";
    }
}
