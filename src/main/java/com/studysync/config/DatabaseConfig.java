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

        // Ignore unexpanded placeholders like ${DB_HOST}
        if (databaseUrl != null && databaseUrl.contains("${")) {
            log.warn("DATABASE_URL contains unresolved placeholder '{}', ignoring", databaseUrl);
            databaseUrl = null;
        }

        if (StringUtils.hasText(databaseUrl)) {
            boolean isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
            boolean isMysql = databaseUrl.startsWith("mysql://") || databaseUrl.startsWith("mysqls://");

            if (isPostgres || isMysql) {
                log.info("Configuring DataSource from cloud DATABASE_URL scheme ({})", isMysql ? "mysql" : "postgres");
                try {
                    String prefix;
                    if (databaseUrl.startsWith("postgres://")) prefix = "postgres://";
                    else if (databaseUrl.startsWith("postgresql://")) prefix = "postgresql://";
                    else if (databaseUrl.startsWith("mysqls://")) prefix = "mysqls://";
                    else prefix = "mysql://";

                    // Normalize scheme to http so java.net.URI parses authority and path correctly
                    String normalized = "http://" + databaseUrl.substring(prefix.length());

                    URI uri = new URI(normalized);
                    String host = uri.getHost();
                    int defaultPort = isMysql ? 3306 : 5432;
                    int port = uri.getPort() != -1 ? uri.getPort() : defaultPort;
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

                    String driverClass = isMysql ? "com.mysql.cj.jdbc.Driver" : "org.postgresql.Driver";
                    String jdbcPrefix = isMysql ? "jdbc:mysql://" : "jdbc:postgresql://";
                    String jdbcUrl = jdbcPrefix + host + ":" + port + path;
                    if (StringUtils.hasText(query)) {
                        jdbcUrl += "?" + query;
                    }

                    config.setJdbcUrl(jdbcUrl);
                    config.setDriverClassName(driverClass);
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
        }

        // Clean configuredUrl if it contains unresolved placeholders
        if (configuredUrl != null && configuredUrl.contains("${")) {
            log.warn("Configured JDBC URL contains unresolved placeholder '{}'", configuredUrl);
        }

        if (StringUtils.hasText(configuredUrl)) {
            config.setJdbcUrl(configuredUrl);

            // Auto-detect driver if not explicitly configured or if mismatching
            if (configuredUrl.startsWith("jdbc:mysql:")) {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            } else if (configuredUrl.startsWith("jdbc:postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
        }

        if (StringUtils.hasText(configuredUsername)) {
            config.setUsername(configuredUsername);
        }
        if (configuredPassword != null) {
            config.setPassword(configuredPassword);
        }
        if (StringUtils.hasText(configuredDriver) && !StringUtils.hasText(config.getDriverClassName())) {
            config.setDriverClassName(configuredDriver);
        }

        return config;
    }
}
