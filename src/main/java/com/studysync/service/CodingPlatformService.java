package com.studysync.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.studysync.dto.CodingPlatformRequest;
import com.studysync.dto.CodingPlatformResponse;
import com.studysync.entity.CodingPlatform;
import com.studysync.exception.CodingPlatformNotFoundException;
import com.studysync.repository.CodingPlatformRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class CodingPlatformService {

    private static final String LEETCODE_GRAPHQL = "https://leetcode.com/graphql";
    private static final String CODEFORCES_API = "https://codeforces.com/api/user.info?handles=";

    private final CodingPlatformRepository repository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public CodingPlatformService(CodingPlatformRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().build();
    }

    public List<CodingPlatformResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public CodingPlatformResponse create(CodingPlatformRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new IllegalArgumentException("Coding platform already exists: " + request.getName());
        }
        CodingPlatform platform = new CodingPlatform();
        apply(platform, request);
        return toResponse(repository.save(platform));
    }

    public CodingPlatformResponse update(Long id, CodingPlatformRequest request) {
        CodingPlatform platform = repository.findById(id)
                .orElseThrow(() -> new CodingPlatformNotFoundException(id));
        apply(platform, request);
        return toResponse(repository.save(platform));
    }

    public void delete(Long id) {
        CodingPlatform platform = repository.findById(id)
                .orElseThrow(() -> new CodingPlatformNotFoundException(id));
        repository.delete(platform);
    }

    public CodingPlatformResponse fetchProfile(String platformName, String username) {
        String name = platformName.trim();
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
            case "codechef", "hackerrank", "cses", "spoj" -> {
                // No stable unauthenticated statistics API is used here.
                // Unknown statistics remain zero instead of being fabricated.
            }
            default -> throw new IllegalArgumentException("Unsupported coding platform: " + name);
        }

        return toResponse(result);
    }

    private void fetchLeetCode(CodingPlatform result, String username) {
        String query = "query($username:String!){matchedUser(username:$username){username profile{ranking} submitStatsGlobal{acSubmissionNum{difficulty count}} userContestRanking{attendedContestsCount rating globalRanking}}}";
        try {
            String body = objectMapper.writeValueAsString(java.util.Map.of(
                    "query", query,
                    "variables", java.util.Map.of("username", username)));

            HttpRequest request = HttpRequest.newBuilder(URI.create(LEETCODE_GRAPHQL))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "StudySync/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Unable to fetch LeetCode profile (HTTP " + response.statusCode() + ")");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode user = root.path("data").path("matchedUser");
            if (user.isMissingNode() || user.isNull()) {
                throw new IllegalArgumentException("LeetCode username not found: " + username);
            }

            result.setUsername(user.path("username").asText(username));
            result.setGlobalRank(user.path("profile").path("ranking").asLong(0));

            int solved = 0;
            for (JsonNode item : user.path("submitStatsGlobal").path("acSubmissionNum")) {
                if ("All".equalsIgnoreCase(item.path("difficulty").asText())) {
                    solved = item.path("count").asInt(0);
                }
            }
            result.setProblemsSolved(solved);

            JsonNode contest = user.path("userContestRanking");
            result.setContestsParticipated(contest.path("attendedContestsCount").asInt(0));
            result.setRating(contest.path("rating").asDouble(0));
            result.setPlatformRank(contest.path("globalRanking").asLong(0));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("LeetCode profile request was interrupted");
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read LeetCode profile data");
        }
    }

    private void fetchCodeforces(CodingPlatform result, String username) {
        try {
            String encoded = java.net.URLEncoder.encode(username, java.nio.charset.StandardCharsets.UTF_8);
            HttpRequest infoRequest = HttpRequest.newBuilder(URI.create(CODEFORCES_API + encoded))
                    .header("User-Agent", "StudySync/1.0")
                    .GET().build();
            HttpResponse<String> infoResponse = httpClient.send(infoRequest, HttpResponse.BodyHandlers.ofString());
            if (infoResponse.statusCode() != 200) {
                throw new IllegalArgumentException("Unable to fetch Codeforces profile (HTTP " + infoResponse.statusCode() + ")");
            }

            JsonNode root = objectMapper.readTree(infoResponse.body());
            if (!"OK".equals(root.path("status").asText()) || !root.path("result").isArray() || root.path("result").size() == 0) {
                throw new IllegalArgumentException("Codeforces username not found: " + username);
            }

            JsonNode user = root.path("result").get(0);
            result.setRating(user.path("rating").asDouble(0));
            result.setHighestRating(user.path("maxRating").asDouble(0));

            HttpRequest ratingRequest = HttpRequest.newBuilder(
                            URI.create("https://codeforces.com/api/user.rating?handle=" + encoded))
                    .header("User-Agent", "StudySync/1.0")
                    .GET().build();
            HttpResponse<String> ratingResponse = httpClient.send(ratingRequest, HttpResponse.BodyHandlers.ofString());
            if (ratingResponse.statusCode() == 200) {
                JsonNode ratingRoot = objectMapper.readTree(ratingResponse.body());
                if ("OK".equals(ratingRoot.path("status").asText()) && ratingRoot.path("result").isArray()) {
                    result.setContestsParticipated(ratingRoot.path("result").size());
                }
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Codeforces profile request was interrupted");
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read Codeforces profile data");
        }
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
        platform.setUrl(request.getUrl() == null || request.getUrl().isBlank()
                ? buildProfileUrl(name, username) : request.getUrl().trim());
        platform.setProblemsSolved(request.getProblemsSolved() == null ? 0 : request.getProblemsSolved());
        platform.setRating(request.getRating() == null ? 0D : request.getRating());
        platform.setGlobalRank(request.getGlobalRank() == null ? 0L : request.getGlobalRank());
        platform.setContestsParticipated(request.getContestsParticipated() == null ? 0 : request.getContestsParticipated());
        platform.setHighestRating(request.getHighestRating() == null ? 0D : request.getHighestRating());
        platform.setStreak(request.getStreak() == null ? 0 : request.getStreak());
        platform.setPlatformRank(request.getPlatformRank() == null ? 0L : request.getPlatformRank());
    }

    private CodingPlatformResponse toResponse(CodingPlatform p) {
        return new CodingPlatformResponse(p.getId(), p.getName(), p.getUrl(), p.getUsername(),
                p.getProblemsSolved(), p.getRating(), p.getGlobalRank(), p.getContestsParticipated(),
                p.getHighestRating(), p.getStreak(), p.getPlatformRank());
    }
}
