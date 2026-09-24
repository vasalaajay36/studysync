import { useEffect, useState } from "react";
import "./CodingPlatforms.css";

const PLATFORM_OPTIONS = [
  {
    name: "LeetCode",
    url: "https://leetcode.com/",
    profileUrl: "https://leetcode.com/u/",
    icon: "LC",
    description: "Algorithms & Data Structures",
    automatic: true,
  },
  {
    name: "Codeforces",
    url: "https://codeforces.com/",
    profileUrl: "https://codeforces.com/profile/",
    icon: "CF",
    description: "Competitive Programming",
    automatic: false,
  },
  {
    name: "CodeChef",
    url: "https://www.codechef.com/",
    profileUrl: "https://www.codechef.com/users/",
    icon: "CC",
    description: "Competitive Programming",
    automatic: false,
  },
  {
    name: "SPOJ",
    url: "https://www.spoj.com/",
    profileUrl: "https://www.spoj.com/users/",
    icon: "SP",
    description: "Programming Problems",
    automatic: false,
  },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/",
    profileUrl: "https://www.hackerrank.com/profile/",
    icon: "HR",
    description: "Programming Practice",
    automatic: false,
  },
  {
    name: "CSES",
    url: "https://cses.fi/",
    profileUrl: "",
    icon: "CS",
    description: "Algorithmic Problem Set",
    automatic: false,
  },
];

const EMPTY_FORM = {
  name: "",
  url: "",
  username: "",
  problemsSolved: 0,
  rating: 0,
  globalRank: 0,
  contestsParticipated: 0,
  highestRating: 0,
  streak: 0,
  platformRank: 0,
};

function CodingPlatforms() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/coding-platforms",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load coding platforms");
      }

      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error("Coding platform loading error:", error);
      setErrorMessage("Unable to load coding profiles.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePlatformChange = (event) => {
    const selectedName = event.target.value;

    const selectedPlatform = PLATFORM_OPTIONS.find(
      (platform) => platform.name === selectedName
    );

    if (!selectedPlatform) {
      setFormData({ ...EMPTY_FORM });
      setProfileFetched(false);
      return;
    }

    setFormData({
      ...EMPTY_FORM,
      name: selectedPlatform.name,
      url:
        selectedPlatform.profileUrl ||
        selectedPlatform.url,
    });

    setProfileFetched(false);
    setErrorMessage("");
  };

  const handleUsernameChange = (event) => {
    const username = event.target.value;

    const selectedPlatform = PLATFORM_OPTIONS.find(
      (platform) => platform.name === formData.name
    );

    let generatedUrl = formData.url;

    if (
      selectedPlatform &&
      selectedPlatform.profileUrl &&
      username.trim()
    ) {
      generatedUrl =
        selectedPlatform.profileUrl +
        username.trim();
    }

    setFormData((previous) => ({
      ...previous,
      username,
      url: generatedUrl,
    }));
  };

  const fetchProfile = async () => {
    if (!formData.name) {
      setErrorMessage("Please select a coding platform.");
      return;
    }

    if (!formData.username.trim()) {
      setErrorMessage("Please enter your username.");
      return;
    }

    const selectedPlatform = PLATFORM_OPTIONS.find(
      (platform) => platform.name === formData.name
    );

    if (!selectedPlatform?.automatic) {
      setErrorMessage(
        "Automatic statistics fetching is currently available for LeetCode only."
      );
      return;
    }

    setFetchingProfile(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        platform: formData.name,
        username: formData.username.trim(),
      });

      const response = await fetch(
        `http://localhost:8080/api/coding-platforms/fetch?${params}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to fetch profile"
        );
      }

      setFormData((previous) => ({
        ...previous,
        name: data.name || previous.name,
        url: data.url || previous.url,
        username:
          data.username || previous.username,
        problemsSolved: data.problemsSolved || 0,
        rating: data.rating || 0,
        globalRank: data.globalRank || 0,
        contestsParticipated:
          data.contestsParticipated || 0,
        highestRating: data.highestRating || 0,
        streak: data.streak || 0,
        platformRank: data.platformRank || 0,
      }));

      setProfileFetched(true);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setErrorMessage(
        error.message || "Unable to fetch coding profile."
      );
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name) {
      setErrorMessage("Please select a coding platform.");
      return;
    }

    if (!formData.username.trim()) {
      setErrorMessage("Please enter your username.");
      return;
    }

    const url = editingId
      ? `http://localhost:8080/api/coding-platforms/${editingId}`
      : "http://localhost:8080/api/coding-platforms";

    const method = editingId ? "PUT" : "POST";

    const payload = {
      name: formData.name,
      url: formData.url,
      username: formData.username,

      problemsSolved:
        Number(formData.problemsSolved) || 0,

      rating:
        Number(formData.rating) || 0,

      globalRank:
        Number(formData.globalRank) || 0,

      contestsParticipated:
        Number(formData.contestsParticipated) || 0,

      highestRating:
        Number(formData.highestRating) || 0,

      streak:
        Number(formData.streak) || 0,

      platformRank:
        Number(formData.platformRank) || 0,
    };

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to save coding platform"
        );
      }

      if (editingId) {
        setPlatforms((previous) =>
          previous.map((platform) =>
            platform.id === data.id
              ? data
              : platform
          )
        );
      } else {
        setPlatforms((previous) => [
          ...previous,
          data,
        ]);
      }

      resetForm();

      setErrorMessage("");
    } catch (error) {
      console.error(
        "Coding platform save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save coding platform."
      );
    }
  };

  const editPlatform = (platform) => {
    setFormData({
      name: platform.name || "",
      url: platform.url || "",
      username: platform.username || "",

      problemsSolved:
        platform.problemsSolved ?? 0,

      rating:
        platform.rating ?? 0,

      globalRank:
        platform.globalRank ?? 0,

      contestsParticipated:
        platform.contestsParticipated ?? 0,

      highestRating:
        platform.highestRating ?? 0,

      streak:
        platform.streak ?? 0,

      platformRank:
        platform.platformRank ?? 0,
    });

    setEditingId(platform.id);

    setProfileFetched(true);

    setErrorMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePlatform = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coding profile?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/coding-platforms/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(
          "Unable to delete coding platform"
        );
      }

      setPlatforms((previous) =>
        previous.filter(
          (platform) => platform.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Coding platform deletion error:",
        error
      );

      setErrorMessage(
        "Unable to delete coding platform."
      );
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setProfileFetched(false);
    setFetchingProfile(false);
    setShowForm(false);
  };

  const getPlatformInfo = (name) => {
    return (
      PLATFORM_OPTIONS.find(
        (platform) =>
          platform.name.toLowerCase() ===
          name?.toLowerCase()
      ) || {
        icon: "CP",
        description: "Coding Platform",
      }
    );
  };

  const goTo = (path) => {
    window.location.href = path;
  };

  const logout = () => {
    localStorage.removeItem("student");
    window.location.href = "/";
  };

  const availablePlatforms =
    PLATFORM_OPTIONS.filter(
      (option) =>
        !platforms.some(
          (platform) =>
            platform.name?.toLowerCase() ===
            option.name.toLowerCase()
        )
    );

  return (
    <div className="coding-platforms-page">

      <aside className="coding-sidebar">
        <h2 className="coding-logo">
          Study<span>Sync</span>
        </h2>

        <nav className="coding-nav">
          <button onClick={() => goTo("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => goTo("/tasks")}>
            Tasks
          </button>

          <button onClick={() => goTo("/subjects")}>
            Subjects
          </button>

          <button
            onClick={() =>
              goTo("/study-sessions")
            }
          >
            Study Sessions
          </button>

          <button
            className="active"
            onClick={() =>
              goTo("/coding-platforms")
            }
          >
            Coding Platforms
          </button>
        </nav>

        <button
          className="logout-coding-button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      <main className="coding-main">

        <header className="coding-header">
          <div>
            <div className="page-eyebrow">
              YOUR CODING JOURNEY
            </div>

            <h1>Coding Profiles</h1>

            <p>
              Keep your competitive programming
              profiles, statistics and progress
              in one place.
            </p>
          </div>

          <div className="coding-header-buttons">

            <button
              className="add-platform-button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setFormData({ ...EMPTY_FORM });
                  setEditingId(null);
                  setProfileFetched(false);
                  setShowForm(true);
                }
              }}
            >
              {showForm
                ? "Cancel"
                : "+ Add Profile"}
            </button>

            <button
              className="back-coding-button"
              onClick={() =>
                goTo("/dashboard")
              }
            >
              Dashboard
            </button>

          </div>
        </header>

        {errorMessage && (
          <div className="coding-error">
            {errorMessage}
          </div>
        )}

        {showForm && (
          <form
            className="coding-form"
            onSubmit={handleSubmit}
          >

            <div className="form-title">
              <div>
                <span className="form-small-title">
                  PROFILE SETUP
                </span>

                <h2>
                  {editingId
                    ? "Edit Coding Profile"
                    : "Add Coding Profile"}
                </h2>
              </div>

              <span className="form-badge">
                {editingId ? "EDIT" : "NEW"}
              </span>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Coding Platform</label>

                {editingId ? (
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                  />
                ) : (
                  <select
                    value={formData.name}
                    onChange={
                      handlePlatformChange
                    }
                    required
                  >
                    <option value="">
                      Select a platform
                    </option>

                    {availablePlatforms.map(
                      (platform) => (
                        <option
                          key={platform.name}
                          value={platform.name}
                        >
                          {platform.name}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Username</label>

                <input
                  type="text"
                  value={formData.username}
                  onChange={
                    handleUsernameChange
                  }
                  placeholder="Enter username"
                  required
                />
              </div>

            </div>

            <div className="auto-url-box">
              <span>PROFILE URL</span>

              <input
                type="url"
                value={formData.url}
                onChange={(event) =>
                  updateField(
                    "url",
                    event.target.value
                  )
                }
                placeholder="Profile URL"
              />
            </div>

            {!editingId &&
              formData.name === "LeetCode" && (
                <button
                  type="button"
                  className="fetch-profile-button"
                  onClick={fetchProfile}
                  disabled={fetchingProfile}
                >
                  {fetchingProfile
                    ? "Fetching LeetCode Profile..."
                    : "Fetch Profile Automatically"}
                </button>
              )}

            <div className="form-grid">

              <div className="form-group">
                <label>Problems Solved</label>

                <input
                  type="number"
                  min="0"
                  value={formData.problemsSolved}
                  onChange={(event) =>
                    updateField(
                      "problemsSolved",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Rating</label>

                <input
                  type="number"
                  min="0"
                  value={formData.rating}
                  onChange={(event) =>
                    updateField(
                      "rating",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Global Rank</label>

                <input
                  type="number"
                  min="0"
                  value={formData.globalRank}
                  onChange={(event) =>
                    updateField(
                      "globalRank",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Contests Participated</label>

                <input
                  type="number"
                  min="0"
                  value={
                    formData.contestsParticipated
                  }
                  onChange={(event) =>
                    updateField(
                      "contestsParticipated",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Highest Rating</label>

                <input
                  type="number"
                  min="0"
                  value={formData.highestRating}
                  onChange={(event) =>
                    updateField(
                      "highestRating",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Streak</label>

                <input
                  type="number"
                  min="0"
                  value={formData.streak}
                  onChange={(event) =>
                    updateField(
                      "streak",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Platform Rank</label>

                <input
                  type="number"
                  min="0"
                  value={formData.platformRank}
                  onChange={(event) =>
                    updateField(
                      "platformRank",
                      event.target.value
                    )
                  }
                />
              </div>

            </div>

            {profileFetched && (
              <div className="profile-preview">

                <div className="preview-header">
                  <div>
                    <span>
                      PROFILE READY
                    </span>

                    <h3>
                      {formData.username}
                    </h3>
                  </div>

                  <div className="preview-success">
                    ✓ Verified
                  </div>
                </div>

                <div className="preview-stats">

                  <div>
                    <span>Problems</span>
                    <strong>
                      {formData.problemsSolved}
                    </strong>
                  </div>

                  <div>
                    <span>Rating</span>
                    <strong>
                      {formData.rating || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Global Rank</span>
                    <strong>
                      {formData.globalRank
                        ? `#${formData.globalRank}`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Contests</span>
                    <strong>
                      {formData.contestsParticipated}
                    </strong>
                  </div>

                  <div>
                    <span>Highest Rating</span>
                    <strong>
                      {formData.highestRating ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Streak</span>
                    <strong>
                      {formData.streak} days
                    </strong>
                  </div>

                </div>
              </div>
            )}

            <button
              className="save-platform-button"
              type="submit"
            >
              {editingId
                ? "Save Changes"
                : "Save Profile"}
            </button>

          </form>
        )}

        {loading && (
          <div className="coding-loading">
            Loading your coding profiles...
          </div>
        )}

        {!loading && platforms.length === 0 && (
          <div className="empty-profile">
            <div className="empty-icon">CP</div>

            <h2>
              Build your coding portfolio
            </h2>

            <p>
              Add your coding profiles and
              automatically track your
              competitive programming progress.
            </p>

            <button
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Your First Profile
            </button>
          </div>
        )}

        {!loading && platforms.length > 0 && (
          <section className="coding-grid">

            {platforms.map((platform) => {
              const info =
                getPlatformInfo(platform.name);

              return (
                <div
                  className="coding-card"
                  key={platform.id}
                >

                  <div className="card-top">

                    <div className="platform-icon">
                      {info.icon}
                    </div>

                    <div className="platform-heading">
                      <h2>{platform.name}</h2>

                      <p>
                        {info.description}
                      </p>
                    </div>

                    <div className="profile-status">
                      ACTIVE
                    </div>

                  </div>

                  <div className="username-row">

                    <span>
                      @{platform.username}
                    </span>

                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Profile ↗
                    </a>

                  </div>

                  <div className="profile-stats">

                    <div className="profile-stat">
                      <span>Problems</span>

                      <strong>
                        {platform.problemsSolved || 0}
                      </strong>
                    </div>

                    <div className="profile-stat">
                      <span>Rating</span>

                      <strong>
                        {platform.rating || "—"}
                      </strong>
                    </div>

                    <div className="profile-stat">
                      <span>Global Rank</span>

                      <strong>
                        {platform.globalRank
                          ? `#${platform.globalRank}`
                          : "—"}
                      </strong>
                    </div>

                  </div>

                  <div className="secondary-stats">

                    <div>
                      <span>Contests</span>

                      <strong>
                        {platform.contestsParticipated ||
                          0}
                      </strong>
                    </div>

                    <div>
                      <span>Highest Rating</span>

                      <strong>
                        {platform.highestRating ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Streak</span>

                      <strong>
                        {platform.streak || 0} days
                      </strong>
                    </div>

                  </div>

                  <div className="card-actions">

                    <button
                      className="edit-platform-button"
                      onClick={() =>
                        editPlatform(platform)
                      }
                    >
                      Edit Profile
                    </button>

                    <button
                      className="delete-platform-button"
                      onClick={() =>
                        deletePlatform(platform.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })}

          </section>
        )}

      </main>
    </div>
  );
}

export default CodingPlatforms;