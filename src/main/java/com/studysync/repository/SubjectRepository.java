package com.studysync.repository;

import com.studysync.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);
}
