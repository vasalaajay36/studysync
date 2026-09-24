package com.studysync.controller;

import com.studysync.dto.TaskRequest;
import com.studysync.dto.TaskResponse;
import com.studysync.service.TaskService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(HttpSession session) {
        return taskService.getTasksByStudentId(AuthController.authenticatedStudentId(session));
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable Long id, HttpSession session) {
        TaskResponse response = taskService.getTaskById(id);
        requireOwner(response.getStudentId(), session);
        return response;
    }

    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody TaskRequest request,
                                   HttpSession session) {
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return taskService.createTask(request);
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id,
                                   @Valid @RequestBody TaskRequest request,
                                   HttpSession session) {
        requireOwner(taskService.getTaskById(id).getStudentId(), session);
        request.setStudentId(AuthController.authenticatedStudentId(session));
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id, HttpSession session) {
        requireOwner(taskService.getTaskById(id).getStudentId(), session);
        taskService.deleteTask(id);
    }

    @GetMapping("/student/{studentId}")
    public List<TaskResponse> getTasksByStudentId(@PathVariable Long studentId,
                                                  HttpSession session) {
        requireOwner(studentId, session);
        return taskService.getTasksByStudentId(studentId);
    }

    private void requireOwner(Long ownerId, HttpSession session) {
        if (!ownerId.equals(AuthController.authenticatedStudentId(session))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another student's task");
        }
    }
}
