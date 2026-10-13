package com.studysync.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url:#{null}}") String configuredUrl,
            @Value("${spring.datasource.username:#{null}}") String configuredUsername,
            @Value("${spring.datasource.password:#{null}}") String configuredPassword,
            @Value("${spring.datasource.driver-class-name:#{null}}") String configuredDriver) {

        HikariConfig config = resolveConfig(configuredUrl, configuredUsername, configuredPassword, configuredDriver);
        return new HikariDataSource(config);
    }

    public HikariConfig resolveConfig(
            String configuredUrl,
            String configuredUsername,
            String configuredPassword,
            String configuredDriver) {

        String databaseUrl = System.getenv("DATABASE_URL");
        if (!StringUtils.hasText(databaseUrl)) {
            databaseUrl = System.getProperty("DATABASE_URL");
        }

        HikariConfig config = new HikariConfig();
        // Allow graceful connection attempts without failing fast before the cloud database is ready
        config.setInitializationFailTimeout(-1);

        if (StringUtils.hasText(databaseUrl) &&
                (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            log.info("Configuring DataSource from Render DATABASE_URL");
            try {
                // Normalize scheme to http so java.net.URI parses authority and path correctly
                String normalized = databaseUrl.startsWith("postgres://")
                        ? "http://" + databaseUrl.substring("postgres://".length())
                        : "http://" + databaseUrl.substring("postgresql://".length());

                URI uri = new URI(normalized);
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String userInfo = uri.getUserInfo();
                String query = uri.getQuery();

                String username = configuredUsername;
                String password = configuredPassword;

                if (StringUtils.hasText(userInfo)) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) {
                        password = parts[1];
                    }
                }

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (StringUtils.hasText(query)) {
                    jdbcUrl += "?" + query;
                }

                config.setJdbcUrl(jdbcUrl);
                config.setDriverClassName("org.postgresql.Driver");
                if (StringUtils.hasText(username)) {
                    config.setUsername(username);
                }
                if (password != null) {
                    config.setPassword(password);
                }
                return config;
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL: {}, falling back to standard datasource properties", e.getMessage());
            }
        }

        if (StringUtils.hasText(configuredUrl)) {
            config.setJdbcUrl(configuredUrl);
        }
        if (StringUtils.hasText(configuredUsername)) {
            config.setUsername(configuredUsername);
        }
        if (configuredPassword != null) {
            config.setPassword(configuredPassword);
        }
        if (StringUtils.hasText(configuredDriver)) {
            config.setDriverClassName(configuredDriver);
        }

        return config;
    }
}
