import { useEffect, useMemo, useState } from "react";
import "./CodingPlatforms.css";

const PLATFORM_OPTIONS = [
  {
    name: "LeetCode",
    icon: "LC",
    description: "Algorithms & Data Structures",
    profileUrl: "https://leetcode.com/u/",
    automatic: true,
  },
  {
    name: "Codeforces",
    icon: "CF",
    description: "Competitive Programming",
    profileUrl: "https://codeforces.com/profile/",
    automatic: true,
  },
  {
    name: "CodeChef",
    icon: "CC",
    description: "Competitive Programming",
    profileUrl: "https://www.codechef.com/users/",
    automatic: true,
  },
  {
    name: "HackerRank",
    icon: "HR",
    description: "Programming Practice",
    profileUrl: "https://www.hackerrank.com/profile/",
    automatic: true,
  },
  {
    name: "SPOJ",
    icon: "SP",
    description: "Programming Problems",
    profileUrl: "https://www.spoj.com/users/",
    automatic: true,
  },
  {
    name: "CSES",
    icon: "CS",
    description: "Algorithmic Problem Set",
    profileUrl: "https://cses.fi/user/",
    automatic: true,
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

const numberFields = [
  ["problemsSolved", "Problems Solved"],
  ["rating", "Rating"],
  ["globalRank", "Global Rank"],
  ["contestsParticipated", "Contests"],
  ["highestRating", "Highest Rating"],
  ["streak", "Streak"],
  ["platformRank", "Platform Rank"],
];

async function readApiResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function platformInfo(name) {
  return (
    PLATFORM_OPTIONS.find(
      (platform) => platform.name.toLowerCase() === String(name || "").toLowerCase()
    ) || {
      name: name || "Coding Platform",
      icon: "CP",
      description: "Coding Platform",
      profileUrl: "",
      automatic: true,
    }
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return number === 0 ? "0" : "—";
  return number.toLocaleString("en-IN");
}

function formatRating(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "—";
  return number.toFixed(2);
}

function CodingPlatforms() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/coding-platforms", {
        credentials: "include",
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : data?.message || data?.detail || `Unable to load profiles (HTTP ${response.status}).`
        );
      }

      setPlatforms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Coding profiles load error:", error);
      setErrorMessage(error.message || "Unable to load coding profiles.");
    } finally {
      setLoading(false);
    }
  };

  const availablePlatforms = useMemo(
    () =>
      PLATFORM_OPTIONS.filter(
        (option) =>
          !platforms.some(
            (profile) =>
              profile.name?.toLowerCase() === option.name.toLowerCase()
          )
      ),
    [platforms]
  );

  const automaticProfiles = platforms.filter(
    (profile) => platformInfo(profile.name).automatic
  );

  const totalProblems = platforms.reduce(
    (sum, profile) => sum + (Number(profile.problemsSolved) || 0),
    0
  );

  const bestRating = platforms.reduce(
    (best, profile) => Math.max(best, Number(profile.highestRating) || 0),
    0
  );

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openCreateForm = () => {
    clearMessages();
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setProfileFetched(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (profile) => {
    clearMessages();
    setEditingId(profile.id);
    setProfileFetched(true);
    setFormData({
      name: profile.name || "",
      url: profile.url || "",
      username: profile.username || "",
      problemsSolved: profile.problemsSolved ?? 0,
      rating: profile.rating ?? 0,
      globalRank: profile.globalRank ?? 0,
      rankTitle: profile.rankTitle ?? "",
      contestsParticipated: profile.contestsParticipated ?? 0,
      highestRating: profile.highestRating ?? 0,
      streak: profile.streak ?? 0,
      platformRank: profile.platformRank ?? 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setProfileFetched(false);
  };

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const selectPlatform = (event) => {
    const name = event.target.value;
    const info = platformInfo(name);

    setFormData({
      ...EMPTY_FORM,
      name,
      url: info.profileUrl,
    });
    setProfileFetched(false);
    clearMessages();
  };

  const updateUsername = (event) => {
    const username = event.target.value;
    const info = platformInfo(formData.name);

    setFormData((previous) => ({
      ...previous,
      username,
      url:
        info.profileUrl && username.trim()
          ? info.profileUrl + encodeURIComponent(username.trim())
          : previous.url,
    }));
  };

  const requestProfile = async (name, username) => {
    const info = platformInfo(name);

    if (!info.automatic) {
      throw new Error(
        `${info.name} does not support automatic statistics yet. Enter the statistics manually.`
      );
    }

    const params = new URLSearchParams({
      platform: name,
      username: username.trim(),
    });

    const response = await fetch(
      `/api/coding-platforms/fetch?${params.toString()}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Your session has expired. Please sign in again."
          : data?.message ||
              data?.detail ||
              data?.error ||
              `Unable to fetch profile (HTTP ${response.status}).`
      );
    }

    return data;
  };

  const fetchProfile = async () => {
    if (!formData.name || !formData.username.trim()) {
      setErrorMessage("Select a platform and enter a username first.");
      return;
    }

    setFetchingProfile(true);
    clearMessages();

    try {
      const data = await requestProfile(formData.name, formData.username);

      setFormData((previous) => ({
        ...previous,
        name: data.name || previous.name,
        url: data.url || previous.url,
        username: data.username || previous.username,
        problemsSolved: data.problemsSolved ?? 0,
        rating: data.rating ?? 0,
        globalRank: data.globalRank ?? 0,
        rankTitle: data.rankTitle ?? "",
        contestsParticipated: data.contestsParticipated ?? 0,
        highestRating: data.highestRating ?? 0,
        streak: data.streak ?? 0,
        platformRank: data.platformRank ?? 0,
      }));

      setProfileFetched(true);
      setSuccessMessage("Profile fetched successfully. Review the statistics and save it.");
    } catch (error) {
      console.error("Coding profile fetch error:", error);
      setErrorMessage(error.message || "Unable to fetch coding profile.");
    } finally {
      setFetchingProfile(false);
    }
  };

  const refreshProfile = async (profile) => {
    const info = platformInfo(profile.name);

    if (!info.automatic) {
      setErrorMessage(`${profile.name} requires manual statistics.`);
      return;
    }

    setRefreshingId(profile.id);
    clearMessages();

    try {
      const data = await requestProfile(profile.name, profile.username);

      const payload = {
        name: data.name || profile.name,
        url: data.url || profile.url,
        username: data.username || profile.username,
        problemsSolved: Number(data.problemsSolved) || 0,
        rating: Number(data.rating) || 0,
        globalRank: Number(data.globalRank) || 0,
        rankTitle: data.rankTitle || "",
        contestsParticipated: Number(data.contestsParticipated) || 0,
        highestRating: Number(data.highestRating) || 0,
        streak: Number(data.streak) || 0,
        platformRank: Number(data.platformRank) || 0,
      };

      const response = await fetch(`/api/coding-platforms/${profile.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saved = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          saved?.message ||
            saved?.detail ||
            `Unable to save refreshed profile (HTTP ${response.status}).`
        );
      }

      setPlatforms((previous) =>
        previous.map((item) => (item.id === saved.id ? saved : item))
      );
      setSuccessMessage(`${profile.name} profile synced successfully.`);
    } catch (error) {
      console.error("Coding profile refresh error:", error);
      setErrorMessage(error.message || "Unable to refresh profile.");
    } finally {
      setRefreshingId(null);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!formData.name || !formData.username.trim()) {
      setErrorMessage("Platform and username are required.");
      return;
    }

    const payload = {
      name: formData.name,
      url: formData.url,
      username: formData.username.trim(),
      problemsSolved: Number(formData.problemsSolved) || 0,
      rating: Number(formData.rating) || 0,
      globalRank: Number(formData.globalRank) || 0,
      rankTitle: formData.rankTitle || "",
      contestsParticipated: Number(formData.contestsParticipated) || 0,
      highestRating: Number(formData.highestRating) || 0,
      streak: Number(formData.streak) || 0,
      platformRank: Number(formData.platformRank) || 0,
    };

    try {
      const endpoint = editingId
        ? `/api/coding-platforms/${editingId}`
        : "/api/coding-platforms";

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : data?.message ||
                data?.detail ||
                `Unable to save profile (HTTP ${response.status}).`
        );
      }

      setPlatforms((previous) =>
        editingId
          ? previous.map((profile) => (profile.id === data.id ? data : profile))
          : [...previous, data]
      );

      closeForm();
      setSuccessMessage(
        editingId ? "Coding profile updated." : "Coding profile added."
      );
    } catch (error) {
      console.error("Coding profile save error:", error);
      setErrorMessage(error.message || "Unable to save coding profile.");
    }
  };

  const deleteProfile = async (profile) => {
    if (!window.confirm(`Delete the ${profile.name} profile for @${profile.username}?`)) {
      return;
    }

    clearMessages();

    try {
      const response = await fetch(`/api/coding-platforms/${profile.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.detail ||
            `Unable to delete profile (HTTP ${response.status}).`
        );
      }

      setPlatforms((previous) =>
        previous.filter((item) => item.id !== profile.id)
      );
      setSuccessMessage(`${profile.name} profile deleted.`);
    } catch (error) {
      console.error("Coding profile delete error:", error);
      setErrorMessage(error.message || "Unable to delete coding profile.");
    }
  };

  const goTo = (path) => {
    window.location.assign(path);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("student");
      window.location.assign("/");
    }
  };

  return (
    <div className="coding-platforms-page">
      <aside className="coding-sidebar">
        <div className="coding-brand">
          <h2>
            Study<span>Sync</span>
          </h2>
          <p>Student workspace</p>
        </div>

        <nav className="coding-nav" aria-label="Main navigation">
          <button onClick={() => goTo("/dashboard")}>Dashboard</button>
          <button onClick={() => goTo("/tasks")}>Tasks</button>
          <button onClick={() => goTo("/study-sessions")}>Study Sessions</button>
          <button className="active" onClick={() => goTo("/coding-platforms")}>
            Coding Platforms
          </button>
          <button onClick={() => goTo("/analytics")}>Study Analytics</button>
        </nav>

        <button className="logout-coding-button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="coding-main">
        <header className="coding-header">
          <div>
            <span className="page-eyebrow">CODING PROGRESS</span>
            <h1>Coding Profiles</h1>
            <p>
              Connect your coding accounts and keep your problem-solving progress
              together.
            </p>
          </div>

          <div className="coding-header-actions">
            <button className="secondary-button" onClick={loadPlatforms} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button className="primary-button" onClick={showForm ? closeForm : openCreateForm}>
              {showForm ? "Close Form" : "+ Add Profile"}
            </button>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div className={errorMessage ? "coding-alert error" : "coding-alert success"}>
            <span>{errorMessage || successMessage}</span>
            <button type="button" onClick={clearMessages} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        {!loading && (
          <section className="coding-summary">
            <div>
              <span>PROFILES</span>
              <strong>{platforms.length}</strong>
            </div>
            <div>
              <span>AUTO SYNC</span>
              <strong>{automaticProfiles.length}</strong>
            </div>
            <div>
              <span>PROBLEMS SOLVED</span>
              <strong>{formatNumber(totalProblems)}</strong>
            </div>
            <div>
              <span>BEST RATING</span>
              <strong>{bestRating ? formatRating(bestRating) : "—"}</strong>
            </div>
          </section>
        )}

        {showForm && (
          <form className="coding-form" onSubmit={saveProfile}>
            <div className="form-heading">
              <div>
                <span>{editingId ? "EDIT PROFILE" : "ADD PROFILE"}</span>
                <h2>{editingId ? "Update your coding profile" : "Connect a coding account"}</h2>
              </div>
              <button type="button" className="close-form-button" onClick={closeForm}>
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Platform
                {editingId ? (
                  <input value={formData.name} disabled />
                ) : (
                  <select value={formData.name} onChange={selectPlatform} required>
                    <option value="">Select platform</option>
                    {availablePlatforms.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label>
                Username
                <input
                  value={formData.username}
                  onChange={updateUsername}
                  placeholder="e.g. vasalaajay36"
                  required
                />
              </label>
            </div>

            {formData.name && (
              <div className="profile-url-row">
                <div>
                  <span>PROFILE URL</span>
                  <strong>{formData.url || "Enter your username to generate the URL."}</strong>
                </div>
                {formData.url && (
                  <a href={formData.url} target="_blank" rel="noreferrer">
                    Open ↗
                  </a>
                )}
              </div>
            )}

            {formData.name && (
              <div className="fetch-row">
                <div>
                  <strong>{platformInfo(formData.name).automatic ? "Automatic statistics" : "Manual statistics"}</strong>
                  <span>
                    {platformInfo(formData.name).automatic
                      ? "Fetch the public profile before saving it."
                      : "This platform is saved with statistics you enter."}
                  </span>
                </div>
                <button
                  type="button"
                  className="sync-button"
                  onClick={fetchProfile}
                  disabled={fetchingProfile || !platformInfo(formData.name).automatic}
                >
                  {fetchingProfile ? "Fetching..." : "Fetch Profile"}
                </button>
              </div>
            )}

            <div className="stats-heading">
              <div>
                <span>STATISTICS</span>
                <h3>{profileFetched ? "Fetched profile data" : "Profile statistics"}</h3>
              </div>
              {!platformInfo(formData.name).automatic && formData.name && (
                <small>Enter the values available on your platform.</small>
              )}
            </div>

            <div className="stats-grid">
              {numberFields.map(([field, label]) => (
                <label key={field}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    step={field === "rating" || field === "highestRating" ? "0.01" : "1"}
                    value={formData[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                </label>
              ))}
            </div>

            {profileFetched && (
              <div className="verified-preview">
                <span>PROFILE FETCHED</span>
                <strong>@{formData.username}</strong>
                <p>Review the statistics above, then save the profile to your StudySync account.</p>
              </div>
            )}

            <div className="form-footer">
              <button type="button" className="secondary-button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {editingId ? "Save Changes" : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="coding-empty">
            <div className="loading-spinner" />
            <h2>Loading coding profiles</h2>
            <p>Fetching your saved profiles...</p>
          </div>
        ) : platforms.length === 0 ? (
          <div className="coding-empty">
            <div className="empty-icon">CP</div>
            <h2>Your coding portfolio is empty</h2>
            <p>
              Add LeetCode, Codeforces, CodeChef, HackerRank, SPOJ, CSES or another
              supported platform to start tracking your progress.
            </p>
            <button className="primary-button" onClick={openCreateForm}>
              + Add Your First Profile
            </button>
          </div>
        ) : (
          <section className="coding-grid">
            {platforms.map((profile) => {
              const info = platformInfo(profile.name);
              const refreshing = refreshingId === profile.id;

              return (
                <article className="coding-card" key={profile.id}>
                  <div className="card-heading">
                    <div className="platform-icon">{info.icon}</div>
                    <div className="platform-title">
                      <div>
                        <h2>{profile.name}</h2>
                        <span>{info.description}</span>
                      </div>
                      <span className={info.automatic ? "sync-badge" : "manual-badge"}>
                        {info.automatic ? "AUTO SYNC" : "MANUAL"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-identity">
                    <div>
                      <span>USERNAME</span>
                      <strong>@{profile.username}</strong>
                    </div>
                    {profile.url && (
                      <a href={profile.url} target="_blank" rel="noreferrer">
                        View Profile ↗
                      </a>
                    )}
                  </div>

                  <div className="stats-cards">
                    <div>
                      <span>Problems</span>
                      <strong>{formatNumber(profile.problemsSolved)}</strong>
                    </div>
                    <div>
                      <span>Rating</span>
                      <strong>{formatRating(profile.rating)}</strong>
                    </div>
                    <div>
                      <span>{profile.name === "Codeforces" ? "Official Rank" : "Global Rank"}</span>
                      <strong>{profile.name === "Codeforces"
                        ? (profile.rankTitle || "—")
                        : (profile.globalRank ? `#${formatNumber(profile.globalRank)}` : "—")}</strong>
                    </div>
                    <div>
                      <span>Contests</span>
                      <strong>{formatNumber(profile.contestsParticipated)}</strong>
                    </div>
                    <div>
                      <span>Best Rating</span>
                      <strong>{formatRating(profile.highestRating)}</strong>
                    </div>
                    <div>
                      <span>Streak</span>
                      <strong>{formatNumber(profile.streak)} days</strong>
                    </div>
                  </div>

                  <div className="card-actions">
                    {info.automatic && (
                      <button
                        className="sync-card-button"
                        onClick={() => refreshProfile(profile)}
                        disabled={refreshing}
                      >
                        {refreshing ? "Syncing..." : "↻ Sync Stats"}
                      </button>
                    )}
                    <button className="edit-card-button" onClick={() => openEditForm(profile)}>
                      Edit
                    </button>
                    <button className="delete-card-button" onClick={() => deleteProfile(profile)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default CodingPlatforms;
