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
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
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
            case "codechef" -> fetchCodeChef(result, user);
            case "hackerrank", "cses", "spoj" -> { }
            default -> throw new IllegalArgumentException("Unsupported coding platform: " + name);
        }
        return toResponse(result);
    }

    private void fetchLeetCode(CodingPlatform result, String username) {
        /*
         * Use LeetCode's public GraphQL endpoint directly. This avoids depending
         * on a third-party proxy that can cold-start or rate-limit Railway.
         * The request mirrors the public query structure used by maintained
         * LeetCode API adapters and sends the required LeetCode Referer header.
         */
        try {
            JsonNode profileData = fetchLeetCodeGraphQL(LEETCODE_PROFILE_QUERY, username);
            JsonNode contestData = fetchLeetCodeGraphQL(LEETCODE_CONTEST_QUERY, username);

            JsonNode matchedUser = profileData.path("matchedUser");
            if (matchedUser.isMissingNode() || matchedUser.isNull()) {
                throw new IllegalArgumentException("LeetCode username not found: " + username);
            }

            result.setUsername(username);
            result.setGlobalRank(matchedUser.path("profile").path("ranking").asLong(0));

            int solved = 0;
            JsonNode solvedStats = matchedUser.path("submitStats").path("acSubmissionNum");
            if (solvedStats.isArray()) {
                for (JsonNode stat : solvedStats) {
                    String difficulty = stat.path("difficulty").asText("");
                    if ("Easy".equalsIgnoreCase(difficulty)
                            || "Medium".equalsIgnoreCase(difficulty)
                            || "Hard".equalsIgnoreCase(difficulty)) {
                        solved += stat.path("count").asInt(0);
                    }
                }
            }
            result.setProblemsSolved(solved);

            JsonNode contest = contestData.path("userContestRanking");
            if (!contest.isMissingNode() && !contest.isNull()) {
                result.setContestsParticipated(
                        contest.path("attendedContestsCount").asInt(0)
                );
                result.setRating(
                        roundToTwoDecimals(contest.path("rating").asDouble(0))
                );
                result.setPlatformRank(
                        contest.path("globalRanking").asLong(0)
                );
            }

            int highestRating = 0;
            JsonNode history = contestData.path("userContestRankingHistory");
            if (history.isArray()) {
                for (JsonNode entry : history) {
                    if (entry.path("attended").asBoolean(false)) {
                        highestRating = Math.max(
                                highestRating,
                                entry.path("rating").asInt(0)
                        );
                    }
                }
            }
            result.setHighestRating((double) highestRating);

            result.setStreak(
                    calculateLeetCodeStreak(
                            matchedUser.path("submissionCalendar").asText("")
                    )
            );
            result.setUrl(buildProfileUrl("leetcode", username));
        } catch (HttpTimeoutException ex) {
            throw new IllegalArgumentException(
                    "LeetCode profile service timed out. Please try again."
            );
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException(
                    "LeetCode profile request was interrupted"
            );
        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Unable to read LeetCode profile data. Please try again."
            );
        }
    }

    private JsonNode fetchLeetCodeGraphQL(String query, String username)
            throws IOException, InterruptedException {
        String body = objectMapper.writeValueAsString(
                java.util.Map.of(
                        "query", query,
                        "variables", java.util.Map.of("username", username)
                )
        );

        HttpRequest request = HttpRequest.newBuilder(
                URI.create(LEETCODE_GRAPHQL)
        )
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("Referer", "https://leetcode.com/")
                .header("User-Agent", "StudySync/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        if (response.statusCode() != 200) {
            throw new IllegalArgumentException(
                    "LeetCode rejected the profile request (HTTP "
                            + response.statusCode() + ")"
            );
        }

        JsonNode payload = objectMapper.readTree(response.body());
        if (payload.has("errors")) {
            throw new IllegalArgumentException(
                    "LeetCode rejected the profile request"
            );
        }

        return payload.path("data");
    }

    private int calculateLeetCodeStreak(String calendarText) {
        if (calendarText == null || calendarText.isBlank()) {
            return 0;
        }

        try {
            JsonNode calendar = objectMapper.readTree(calendarText);
            LocalDate date = LocalDate.now(ZoneOffset.UTC);
            int streak = 0;

            while (calendar.has(String.valueOf(date.toEpochDay() * 86400))) {
                int submissions = calendar
                        .path(String.valueOf(date.toEpochDay() * 86400))
                        .asInt(0);

                if (submissions <= 0) {
                    break;
                }

                streak++;
                date = date.minusDays(1);
            }

            return streak;
        } catch (Exception ignored) {
            return 0;
        }
    }

    private static final String LEETCODE_PROFILE_QUERY = """
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                profile {
                  ranking
                }
                submissionCalendar
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
            }
            """;

    private static final String LEETCODE_CONTEST_QUERY = """
            query getUserContestRanking($username: String!) {
              userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
              }
              userContestRankingHistory(username: $username) {
                attended
                rating
              }
            }
            """;

    private void fetchCodeChef(CodingPlatform result, String username) {
        String url = buildProfileUrl("codechef", username);

        try {
            Document document = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; StudySync/1.0)")
                    .referrer("https://www.google.com/")
                    .timeout(15000)
                    .get();

            String text = document.body().text();

            if (text.contains("404") || text.toLowerCase().contains("user does not exist")
                    || !text.toLowerCase().contains("codechef")) {
                throw new IllegalArgumentException("CodeChef username not found: " + username);
            }

            result.setUsername(username);
            result.setProblemsSolved(extractInteger(text, "Total Problems Solved\\s*:\\s*([\\d,]+)"));
            result.setContestsParticipated(extractInteger(text, "No\\. of Contests Participated\\s*:\\s*([\\d,]+)"));

            java.util.regex.Matcher ratingMatcher = java.util.regex.Pattern
                    .compile("CodeChef Rating\\s+(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(text);
            if (ratingMatcher.find()) {
                result.setRating(Double.parseDouble(ratingMatcher.group(1).replace(",", "")));
            }

            java.util.regex.Matcher highestMatcher = java.util.regex.Pattern
                    .compile("Highest Rating\\s+(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(text);
            if (highestMatcher.find()) {
                result.setHighestRating(Double.parseDouble(highestMatcher.group(1).replace(",", "")));
            } else {
                result.setHighestRating(result.getRating());
            }

            result.setUrl(url);
        } catch (java.net.SocketTimeoutException | HttpTimeoutException ex) {
            throw new IllegalArgumentException(
                    "CodeChef profile service timed out. Please try again."
            );
        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Unable to read CodeChef profile data. Please try again."
            );
        }
    }

    private int extractInteger(String text, String regex) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile(regex, java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text);

        if (!matcher.find()) {
            return 0;
        }

        return Integer.parseInt(matcher.group(1).replace(",", ""));
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
