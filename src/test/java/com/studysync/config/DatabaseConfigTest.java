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
    void parsesAivenMysqlUrlCorrectly() {
        System.setProperty("DATABASE_URL", "mysql://avnadmin:mypassword@mysql-test.aivencloud.com:20055/defaultdb?ssl-mode=REQUIRED");

        HikariConfig hikariConfig = config.resolveConfig(
                null,
                null,
                null,
                null
        );

        assertEquals("jdbc:mysql://mysql-test.aivencloud.com:20055/defaultdb?ssl-mode=REQUIRED", hikariConfig.getJdbcUrl());
        assertEquals("avnadmin", hikariConfig.getUsername());
        assertEquals("mypassword", hikariConfig.getPassword());
        assertEquals("com.mysql.cj.jdbc.Driver", hikariConfig.getDriverClassName());
    }

    @Test
    void ignoresUnresolvedPlaceholderInDatabaseUrl() {
        System.setProperty("DATABASE_URL", "postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}");

        HikariConfig hikariConfig = config.resolveConfig(
                "jdbc:mysql://localhost:3306/fallbackdb",
                "root",
                "pass",
                null
        );

        assertEquals("jdbc:mysql://localhost:3306/fallbackdb", hikariConfig.getJdbcUrl());
        assertEquals("root", hikariConfig.getUsername());
        assertEquals("pass", hikariConfig.getPassword());
        assertEquals("com.mysql.cj.jdbc.Driver", hikariConfig.getDriverClassName());
    }
}
