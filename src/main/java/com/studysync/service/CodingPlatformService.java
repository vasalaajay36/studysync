package com.studysync.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.studysync.dto.CodingPlatformRequest;
import com.studysync.dto.CodingPlatformResponse;
import com.studysync.entity.CodingPlatform;
import com.studysync.entity.Student;
import com.studysync.exception.CodingPlatformNotFoundException;
import com.studysync.exception.StudentNotFoundException;
import com.studysync.repository.CodingPlatformRepository;
import com.studysync.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class CodingPlatformService {
    private static final String LEETCODE_GRAPHQL = "https://leetcode.com/graphql";
    private static final String CODEFORCES_API = "https://codeforces.com/api/user.info?handles=";

    private final CodingPlatformRepository repository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public CodingPlatformService(CodingPlatformRepository repository, StudentRepository studentRepository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public List<CodingPlatformResponse> getAll(Long studentId) {
        requireStudent(studentId);
        return repository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public CodingPlatformResponse create(CodingPlatformRequest request, Long studentId) {
        Student student = requireStudent(studentId);
        String name = normalizePlatformName(request.getName());
        if (repository.existsByNameIgnoreCaseAndStudentId(name, studentId)) {
            throw new IllegalArgumentException("Coding platform already exists for this student: " + name);
        }
        CodingPlatform platform = new CodingPlatform();
        apply(platform, request);
        platform.setName(name);
        platform.setStudent(student);
        return toResponse(repository.save(platform));
    }

    public CodingPlatformResponse update(Long id, CodingPlatformRequest request, Long studentId) {
        CodingPlatform platform = repository.findByIdAndStudentId(id, studentId)
                .orElseThrow(() -> new CodingPlatformNotFoundException(id));
        String name = normalizePlatformName(request.getName());
        if (repository.existsByNameIgnoreCaseAndStudentIdAndIdNot(name, studentId, id)) {
            throw new IllegalArgumentException("Coding platform already exists for this student: " + name);
        }
        apply(platform, request);
        platform.setName(name);
        return toResponse(repository.save(platform));
    }

    public void delete(Long id, Long studentId) {
        CodingPlatform platform = repository.findByIdAndStudentId(id, studentId)
                .orElseThrow(() -> new CodingPlatformNotFoundException(id));
        repository.delete(platform);
    }

    public CodingPlatformResponse fetchProfile(String platformName, String username) {
        String name = normalizePlatformName(platformName);
        String user = username.trim();
        CodingPlatform result = new CodingPlatform();
        result.setName(name);
        result.setUsername(user);
        result.setUrl(buildProfileUrl(name, user));
        result.setProblemsSolved(0);
        result.setContestsParticipated(0);
        result.setStreak(0);
        result.setGlobalRank(0L);
        result.setPlatformRank(0L);
        result.setRating(0D);
        result.setHighestRating(0D);
        switch (name.toLowerCase()) {
            case "leetcode" -> fetchLeetCode(result, user);
            case "codeforces" -> fetchCodeforces(result, user);
            case "codechef", "hackerrank", "cses", "spoj" -> { }
            default -> throw new IllegalArgumentException("Unsupported coding platform: " + name);
        }
        return toResponse(result);
    }

    private void fetchLeetCode(CodingPlatform result, String username) {
        /*
         * LeetCode's public GraphQL endpoint is not a stable public API and can
         * reject server-side requests with HTTP 400. Use the maintained REST
         * adapter for public profile statistics instead.
         */
        try {
            JsonNode profile = getLeetCodeJson(username, "");
            JsonNode solved = getLeetCodeJson(username, "/solved");
            JsonNode contest = getLeetCodeJson(username, "/contest");
            JsonNode calendar = getLeetCodeJson(username, "/calendar");

            if (profile.has("error")) {
                throw new IllegalArgumentException("LeetCode username not found: " + username);
            }

            result.setUsername(profile.path("username").asText(username));
            result.setGlobalRank(profile.path("ranking").asLong(0));

            result.setProblemsSolved(solved.path("solvedProblem").asInt(0));
            result.setContestsParticipated(contest.path("contestAttend").asInt(0));
            result.setRating(roundToTwoDecimals(contest.path("contestRating").asDouble(0)));
            result.setPlatformRank(contest.path("contestGlobalRanking").asLong(0));
            result.setStreak(calendar.path("streak").asInt(0));

            result.setUrl(buildProfileUrl("leetcode", result.getUsername()));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("LeetCode profile request was interrupted");
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read LeetCode profile data");
        }
    }

    private JsonNode getLeetCodeJson(String username, String suffix)
            throws IOException, InterruptedException {
        String encoded = java.net.URLEncoder.encode(
                username,
                java.nio.charset.StandardCharsets.UTF_8
        );

        HttpRequest request = HttpRequest.newBuilder(
                URI.create("https://alfa-leetcode-api.onrender.com/" + encoded + suffix)
        )
                .timeout(Duration.ofSeconds(20))
                .header("Accept", "application/json")
                .header("User-Agent", "StudySync/1.0")
                .GET()
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IllegalArgumentException(
                    "Unable to fetch LeetCode profile data (HTTP "
                            + response.statusCode() + ")"
            );
        }

        JsonNode json = objectMapper.readTree(response.body());

        if (json.has("error") && !json.path("error").asText().isBlank()) {
            throw new IllegalArgumentException(
                    "LeetCode username not found: " + username
            );
        }

        return json;
    }

    private void fetchCodeforces(CodingPlatform result, String username) {
        try {
            String encoded = java.net.URLEncoder.encode(username, java.nio.charset.StandardCharsets.UTF_8);
            HttpRequest infoRequest = HttpRequest.newBuilder(URI.create(CODEFORCES_API + encoded))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "StudySync/1.0").header("Accept", "application/json").GET().build();
            HttpResponse<String> infoResponse = httpClient.send(infoRequest, HttpResponse.BodyHandlers.ofString());
            if (infoResponse.statusCode() != 200) {
                throw new IllegalArgumentException(
                        "Unable to fetch Codeforces profile (HTTP " + infoResponse.statusCode() + ")"
                );
            }
            JsonNode root = objectMapper.readTree(infoResponse.body());
            if (!"OK".equals(root.path("status").asText())) {
                String comment = root.path("comment").asText("Codeforces rejected the profile request");
                throw new IllegalArgumentException("Codeforces: " + comment);
            }
            if (!root.path("result").isArray() || root.path("result").size() == 0) {
                throw new IllegalArgumentException("Codeforces username not found: " + username);
            }
            JsonNode user = root.path("result").get(0);
            result.setRating(roundToTwoDecimals(user.path("rating").asDouble(0)));
            result.setHighestRating(roundToTwoDecimals(user.path("maxRating").asDouble(0)));

            // Codeforces documents a maximum of one anonymous API call every
            // two seconds. Wait before the second request instead of triggering
            // "Call limit exceeded" on the rating endpoint.
            Thread.sleep(2100);

            HttpRequest ratingRequest = HttpRequest.newBuilder(URI.create("https://codeforces.com/api/user.rating?handle=" + encoded))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "StudySync/1.0").GET().build();
            HttpResponse<String> ratingResponse = httpClient.send(ratingRequest, HttpResponse.BodyHandlers.ofString());
            if (ratingResponse.statusCode() == 200) {
                JsonNode ratingRoot = objectMapper.readTree(ratingResponse.body());
                if ("OK".equals(ratingRoot.path("status").asText()) && ratingRoot.path("result").isArray()) {
                    result.setContestsParticipated(ratingRoot.path("result").size());
                } else if ("FAILED".equals(ratingRoot.path("status").asText())) {
                    String comment = ratingRoot.path("comment").asText("");
                    if (!comment.isBlank() && !comment.toLowerCase().contains("call limit")) {
                        throw new IllegalArgumentException("Codeforces: " + comment);
                    }
                }
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Codeforces profile request was interrupted");
        } catch (HttpTimeoutException ex) {
            throw new IllegalArgumentException("Codeforces profile service timed out. Please try again.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Codeforces profile request was interrupted.");
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read Codeforces profile data: " + ex.getMessage());
        }
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String normalizePlatformName(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Coding platform is required");
        }

        return switch (value.trim().toLowerCase()) {
            case "leetcode" -> "LeetCode";
            case "codeforces" -> "Codeforces";
            case "codechef" -> "CodeChef";
            case "hackerrank" -> "HackerRank";
            case "spoj" -> "SPOJ";
            case "cses" -> "CSES";
            default -> throw new IllegalArgumentException("Unsupported coding platform: " + value.trim());
        };
    }

    private Student requireStudent(Long studentId) {
        return studentRepository.findById(studentId).orElseThrow(() -> new StudentNotFoundException(studentId));
    }

    private String buildProfileUrl(String platform, String username) {
        String encoded = java.net.URLEncoder.encode(username, java.nio.charset.StandardCharsets.UTF_8);
        return switch (platform.toLowerCase()) {
            case "leetcode" -> "https://leetcode.com/u/" + encoded + "/";
            case "codeforces" -> "https://codeforces.com/profile/" + encoded;
            case "codechef" -> "https://www.codechef.com/users/" + encoded;
            case "hackerrank" -> "https://www.hackerrank.com/profile/" + encoded;
            case "spoj" -> "https://www.spoj.com/users/" + encoded + "/";
            case "cses" -> "https://cses.fi/user/" + encoded + "/";
            default -> "";
        };
    }

    private void apply(CodingPlatform platform, CodingPlatformRequest request) {
        String name = request.getName().trim();
        String username = request.getUsername().trim();
        platform.setName(name);
        platform.setUsername(username);
        platform.setUrl(request.getUrl() == null || request.getUrl().isBlank() ? buildProfileUrl(name, username) : request.getUrl().trim());
        platform.setProblemsSolved(request.getProblemsSolved() == null ? 0 : request.getProblemsSolved());
        platform.setRating(request.getRating() == null ? 0D : request.getRating());
        platform.setGlobalRank(request.getGlobalRank() == null ? 0L : request.getGlobalRank());
        platform.setContestsParticipated(request.getContestsParticipated() == null ? 0 : request.getContestsParticipated());
        platform.setHighestRating(request.getHighestRating() == null ? 0D : request.getHighestRating());
        platform.setStreak(request.getStreak() == null ? 0 : request.getStreak());
        platform.setPlatformRank(request.getPlatformRank() == null ? 0L : request.getPlatformRank());
    }

    private CodingPlatformResponse toResponse(CodingPlatform p) {
        return new CodingPlatformResponse(p.getId(), p.getName(), p.getUrl(), p.getUsername(), p.getProblemsSolved(), p.getRating(), p.getGlobalRank(), p.getContestsParticipated(), p.getHighestRating(), p.getStreak(), p.getPlatformRank(), p.getStudent() == null ? null : p.getStudent().getId());
    }
}
