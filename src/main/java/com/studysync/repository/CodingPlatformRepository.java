package com.studysync.repository;

import com.studysync.entity.CodingPlatform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodingPlatformRepository extends JpaRepository<CodingPlatform, Long> {
    boolean existsByNameIgnoreCaseAndStudentId(String name, Long studentId);
    List<CodingPlatform> findByStudentId(Long studentId);
    Optional<CodingPlatform> findByIdAndStudentId(Long id, Long studentId);
}
