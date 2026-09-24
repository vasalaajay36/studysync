package com.studysync.repository;

import com.studysync.entity.CodingPlatform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodingPlatformRepository extends JpaRepository<CodingPlatform, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<CodingPlatform> findByNameIgnoreCase(String name);
}
