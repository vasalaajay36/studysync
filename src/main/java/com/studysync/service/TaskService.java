package com.studysync.service;

import com.studysync.dto.TaskRequest;
import com.studysync.dto.TaskResponse;
import com.studysync.entity.Student;
import com.studysync.entity.Task;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.exception.TaskNotFoundException;
import com.studysync.repository.StudentRepository;
import com.studysync.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final StudentRepository studentRepository;

    public TaskService(
            TaskRepository taskRepository,
            StudentRepository studentRepository) {

        this.taskRepository = taskRepository;
        this.studentRepository = studentRepository;
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    public TaskResponse createTask(TaskRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setCompleted(request.getCompleted());
        task.setStudent(student);

        Task savedTask = taskRepository.save(task);

        return convertToResponse(savedTask);
    }

    public TaskResponse getTaskById(Long id) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        return convertToResponse(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {

        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() ->
                        new StudentNotFoundException(request.getStudentId()));

        existingTask.setTitle(request.getTitle());
        existingTask.setDescription(request.getDescription());
        existingTask.setDueDate(request.getDueDate());
        existingTask.setPriority(request.getPriority());
        existingTask.setCompleted(request.getCompleted());
        existingTask.setStudent(student);

        Task updatedTask = taskRepository.save(existingTask);

        return convertToResponse(updatedTask);

        
    }
    public List<TaskResponse> getTasksByStudentId(Long studentId) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        return taskRepository.findByStudentId(studentId).stream()
                .map(this::convertToResponse)
                .toList();
    
    }

    public void deleteTask(Long id) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        taskRepository.delete(task);
    }

    private TaskResponse convertToResponse(Task task) {

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.isCompleted(),
                task.getStudent().getId()
        );
    }
}