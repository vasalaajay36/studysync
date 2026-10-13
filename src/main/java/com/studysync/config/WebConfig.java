package com.studysync.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:}")
    private String configuredOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        CorsRegistration corsRegistration = registry.addMapping("/api/**")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        if (StringUtils.hasText(configuredOrigins)) {
            String[] origins = Arrays.stream(configuredOrigins.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .toArray(String[]::new);
            corsRegistration.allowedOriginPatterns(origins);
        } else {
            corsRegistration.allowedOriginPatterns(
                    "http://localhost:[*]",
                    "http://127.0.0.1:[*]",
                    "https://*.onrender.com",
                    "https://*.vercel.app",
                    "https://*.netlify.app",
                    "https://studysync-production-7698.up.railway.app"
            );
        }
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Serve the React application at the root URL as well as on client-side routes.
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/dashboard").setViewName("forward:/index.html");
        registry.addViewController("/subjects").setViewName("forward:/index.html");
        registry.addViewController("/tasks").setViewName("forward:/index.html");
        registry.addViewController("/study-sessions").setViewName("forward:/index.html");
        registry.addViewController("/coding-platforms").setViewName("forward:/index.html");
        registry.addViewController("/analytics").setViewName("forward:/index.html");
    }
}
