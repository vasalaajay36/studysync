package com.studysync.dto;

public class CodingPlatformResponse {

    private Long id;
    private String name;
    private String url;
    private String username;
    private Integer problemsSolved;
    private Double rating;
    private Long globalRank;
    private Integer contestsParticipated;
    private Double highestRating;
    private Integer streak;
    private Long platformRank;

    public CodingPlatformResponse() {}

    public CodingPlatformResponse(Long id, String name, String url, String username,
                                  Integer problemsSolved, Double rating, Long globalRank,
                                  Integer contestsParticipated, Double highestRating,
                                  Integer streak, Long platformRank) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.username = username;
        this.problemsSolved = problemsSolved;
        this.rating = rating;
        this.globalRank = globalRank;
        this.contestsParticipated = contestsParticipated;
        this.highestRating = highestRating;
        this.streak = streak;
        this.platformRank = platformRank;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(Integer problemsSolved) { this.problemsSolved = problemsSolved; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Long getGlobalRank() { return globalRank; }
    public void setGlobalRank(Long globalRank) { this.globalRank = globalRank; }
    public Integer getContestsParticipated() { return contestsParticipated; }
    public void setContestsParticipated(Integer contestsParticipated) { this.contestsParticipated = contestsParticipated; }
    public Double getHighestRating() { return highestRating; }
    public void setHighestRating(Double highestRating) { this.highestRating = highestRating; }
    public Integer getStreak() { return streak; }
    public void setStreak(Integer streak) { this.streak = streak; }
    public Long getPlatformRank() { return platformRank; }
    public void setPlatformRank(Long platformRank) { this.platformRank = platformRank; }
}
