package com.studysync.config;

import com.zaxxer.hikari.HikariConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseConfigTest {

    private final DatabaseConfig config = new DatabaseConfig();

    @AfterEach
    void tearDown() {
        System.clearProperty("DATABASE_URL");
    }

    @Test
    void fallbackToConfiguredPropertiesWhenDatabaseUrlNotSet() {
        HikariConfig hikariConfig = config.resolveConfig(
                "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
                "sa",
                "",
                "org.h2.Driver"
        );

        assertEquals("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1", hikariConfig.getJdbcUrl());
        assertEquals("sa", hikariConfig.getUsername());
        assertEquals("org.h2.Driver", hikariConfig.getDriverClassName());
    }

    @Test
    void parsesRenderPostgresUrlCorrectly() {
        System.setProperty("DATABASE_URL", "postgres://renderuser:secretpass@dpg-abc123-a.render.com:5432/studysync_db?sslmode=require");

        HikariConfig hikariConfig = config.resolveConfig(
                null,
                null,
                null,
                null
        );

        assertEquals("jdbc:postgresql://dpg-abc123-a.render.com:5432/studysync_db?sslmode=require", hikariConfig.getJdbcUrl());
        assertEquals("renderuser", hikariConfig.getUsername());
        assertEquals("secretpass", hikariConfig.getPassword());
        assertEquals("org.postgresql.Driver", hikariConfig.getDriverClassName());
    }

    @Test
    void parsesPostgresqlUrlWithoutQuery() {
        System.setProperty("DATABASE_URL", "postgresql://dbuser:mypass@localhost:5432/studysync");

        HikariConfig hikariConfig = config.resolveConfig(
                null,
                null,
                null,
                null
        );

        assertEquals("jdbc:postgresql://localhost:5432/studysync", hikariConfig.getJdbcUrl());
        assertEquals("dbuser", hikariConfig.getUsername());
        assertEquals("mypass", hikariConfig.getPassword());
        assertEquals("org.postgresql.Driver", hikariConfig.getDriverClassName());
    }
}
