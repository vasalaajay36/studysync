import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;

  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalStudySessions: 0,
    totalStudyMinutes: 0,
  });

  const [codingPlatformCount, setCodingPlatformCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [codingProfiles, setCodingProfiles] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = student?.id;

  useEffect(() => {
    if (!student) {
      window.location.href = "/";
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        tasksResponse,
        studySessionsResponse,
        codingPlatformsResponse,
        analyticsResponse,
      ] = await Promise.all([
        fetch("/api/dashboard", {
          credentials: "include",
        }),

        fetch(
          "/api/tasks",
          {
            credentials: "include",
          }
        ),

        fetch(
          "/api/study-sessions",
          {
            credentials: "include",
          }
        ),

        fetch("/api/coding-platforms", {
          credentials: "include",
        }),

        fetch("/api/analytics?days=7", {
          credentials: "include",
        }),
      ]);

      if (!dashboardResponse.ok) {
        throw new Error("Unable to load dashboard data");
      }

      if (!tasksResponse.ok) {
        throw new Error("Unable to load tasks");
      }

      if (!studySessionsResponse.ok) {
        throw new Error("Unable to load study sessions");
      }

      if (!codingPlatformsResponse.ok) {
        throw new Error("Unable to load coding platforms");
      }

      if (!analyticsResponse.ok) {
        throw new Error("Unable to load study analytics");
      }

      const dashboardData = await dashboardResponse.json();
      const tasks = await tasksResponse.json();
      const studySessions = await studySessionsResponse.json();
      const codingPlatforms = await codingPlatformsResponse.json();
      const analyticsData = await analyticsResponse.json();

      setStats({
        totalSubjects: dashboardData.totalSubjects || 0,
        totalTasks: dashboardData.totalTasks || 0,
        completedTasks: dashboardData.completedTasks || 0,
        pendingTasks: dashboardData.pendingTasks || 0,
        totalStudySessions: dashboardData.totalStudySessions || 0,
        totalStudyMinutes: dashboardData.totalStudyMinutes || 0,
      });

      const safeCodingPlatforms = Array.isArray(codingPlatforms)
        ? codingPlatforms
        : [];

      setCodingPlatformCount(safeCodingPlatforms.length);
      setCodingProfiles(safeCodingPlatforms);
      setAnalytics(analyticsData);

      const taskActivities = Array.isArray(tasks)
        ? tasks.map((task) => ({
            type: "task",
            title: task.title || "Untitled Task",
            description:
              task.completed === true
                ? "Task completed"
                : "Task pending",
            date: task.dueDate,
            completed: task.completed,
          }))
        : [];

      const studyActivities = Array.isArray(studySessions)
        ? studySessions.map((session) => ({
            type: "study",
            title:
              session.topic || "Study Session",
            description:
              session.completed === true
                ? `${session.durationMinutes || 0} minutes completed`
                : `${session.durationMinutes || 0} minutes planned`,
            date: session.studyDate,
            completed: session.completed,
          }))
        : [];

      const combinedActivity = [
        ...taskActivities,
        ...studyActivities,
      ]
        .filter((activity) => activity.date)
        .sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        )
        .slice(0, 6);

      setRecentActivity(combinedActivity);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.message || "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const goToTasks = () => {
    window.location.href = "/tasks";
  };

  const goToStudySessions = () => {
    window.location.href = "/study-sessions";
  };

  const goToCodingPlatforms = () => {
    window.location.href = "/coding-platforms";
  };

  const goToAnalytics = () => {
    window.location.href = "/analytics";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("student");
      window.location.assign("/");
    }
  };

  const formatMinutes = (minutes) => {
    if (!minutes) {
      return "0 min";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = () => {
    if (!student?.name) {
      return "S";
    }

    return student.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (!student) {
    return null;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <h2 className="logo">
            Study<span>Sync</span>
          </h2>

          <nav>
            <button
              className="nav-item active"
              onClick={goToDashboard}
            >
              <span className="nav-icon">⌂</span>
              Dashboard
            </button>

            <button
              className="nav-item"
              onClick={goToTasks}
            >
              <span className="nav-icon">✓</span>
              Tasks
            </button>

            <button
              className="nav-item"
              onClick={() => (window.location.href = "/subjects")}
            >
              <span className="nav-icon">▦</span>
              Subjects
            </button>

            <button
              className="nav-item"
              onClick={goToStudySessions}
            >
              <span className="nav-icon">◷</span>
              Study Sessions
            </button>

            <button
              className="nav-item"
              onClick={goToCodingPlatforms}
            >
              <span className="nav-icon">&lt;/&gt;</span>
              Coding Platforms
            </button>

            <button className="nav-item" onClick={goToAnalytics}>
              <span className="nav-icon">▥</span>
              Study Analytics
            </button>
          </nav>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">STUDYSYNC DASHBOARD</p>

            <h1>
              Welcome back, {student.name}
            </h1>

            <p className="header-description">
              Keep track of your learning, tasks and
              coding progress in one place.
            </p>
          </div>

          <div className="student-info">
            <div>
              <strong>{student.name}</strong>

              <small>
                {student.course || "Student"}
              </small>
            </div>

            <div className="avatar">
              {getInitials()}
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <section className="welcome-card">
          <div>
            <p className="welcome-label">
              YOUR LEARNING SPACE
            </p>

            <h2>
              Learn consistently. Track everything.
            </h2>

            <p>
              Complete your tasks, record study sessions
              and keep your coding platforms connected.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={goToTasks}
          >
            View My Tasks
          </button>
        </section>

        <section className="stats-grid">
          <button
            className="stat-card"
            onClick={goToTasks}
          >
            <div className="stat-card-top">
              <span className="stat-icon task-icon">
                ✓
              </span>

              <span className="stat-label">
                TASKS
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.totalTasks}
            </strong>

            <small>
              {stats.completedTasks} completed ·{" "}
              {stats.pendingTasks} pending
            </small>
          </button>

          <button
            className="stat-card"
            onClick={goToStudySessions}
          >
            <div className="stat-card-top">
              <span className="stat-icon study-icon">
                ◷
              </span>

              <span className="stat-label">
                STUDY SESSIONS
              </span>
            </div>

            <strong>
              {loading
                ? "—"
                : stats.totalStudySessions}
            </strong>

            <small>
              {formatMinutes(stats.totalStudyMinutes)} studied
            </small>
          </button>

          <button
            className="stat-card"
            onClick={goToCodingPlatforms}
          >
            <div className="stat-card-top">
              <span className="stat-icon coding-icon">
                &lt;/&gt;
              </span>

              <span className="stat-label">
                CODING
              </span>
            </div>

            <strong>
              {loading
                ? "—"
                : codingPlatformCount}
            </strong>

            <small>
              Connected coding platforms
            </small>
          </button>
        </section>

        <section className="coding-progress-banner">
          <div className="coding-progress-copy">
            <p className="section-label">CODING MOMENTUM</p>
            <h2>Keep your problem-solving streak alive.</h2>
            <p>
              Your coding profiles are connected to StudySync.
              Refresh them from Coding Platforms whenever you want the latest statistics.
            </p>
          </div>

          <div className="coding-progress-metrics">
            <div>
              <span>Profiles</span>
              <strong>{loading ? "—" : codingPlatformCount}</strong>
            </div>
            <div>
              <span>Problems Solved</span>
              <strong>
                {loading
                  ? "—"
                  : codingProfiles.reduce(
                      (total, profile) =>
                        total + (Number(profile.problemsSolved) || 0),
                      0
                    )}
              </strong>
            </div>
            <div>
              <span>Best Rating</span>
              <strong>
                {loading || codingProfiles.length === 0
                  ? "—"
                  : Math.max(
                      ...codingProfiles.map(
                        (profile) => Number(profile.rating) || 0
                      )
                    ).toFixed(0)}
              </strong>
            </div>
          </div>

          <button
            className="coding-progress-button"
            onClick={goToCodingPlatforms}
          >
            Open Coding Profiles →
          </button>
        </section>

        <section className="smart-dashboard-grid">
          <div className="smart-panel">
            <div className="section-header">
              <div>
                <p className="section-label">SMART DASHBOARD</p>
                <h2>This Week</h2>
              </div>
              <button className="mini-link" onClick={() => (window.location.href = "/analytics")}>View Analytics →</button>
            </div>
            <div className="smart-metrics">
              <div><span>Study Time</span><strong>{loading ? "—" : formatMinutes(analytics?.totalStudyMinutes)}</strong></div>
              <div><span>Study Days</span><strong>{loading ? "—" : analytics?.studyDays ?? 0}</strong></div>
              <div><span>Task Completion</span><strong>{loading ? "—" : `${analytics?.taskCompletionRate ?? 0}%`}</strong></div>
            </div>
            <div className="dashboard-week-chart">
              {(analytics?.dailyStudy || []).map((day) => {
                const value = Number(day.minutes) || 0;
                const max = Math.max(1, ...(analytics?.dailyStudy || []).map((item) => Number(item.minutes) || 0));
                return (
                  <div className="dashboard-week-column" key={day.date} title={`${day.date}: ${value} min`}>
                    <div className="dashboard-week-bar"><span style={{ height: `${(value / max) * 100}%` }} /></div>
                    <small>{new Date(day.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</small>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="smart-panel smart-insight">
            <p className="section-label">SMART INSIGHT</p>
            <h2>{(analytics?.studyDays || 0) >= 5 ? "Excellent consistency." : "Build your study streak."}</h2>
            <p>
              {(analytics?.studyDays || 0) >= 5
                ? `You studied on ${analytics.studyDays} of the last ${analytics.periodDays} days. Keep protecting your focus time.`
                : "Try to complete one focused session today. Consistency across several days will make your progress easier to sustain."}
            </p>
            <button className="primary-button" onClick={goToStudySessions}>Start Focus Mode</button>
          </div>
        </section>

        <section className="content-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <p className="section-label">
                  ACTIVITY
                </p>

                <h2>Recent Activity</h2>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading your activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="empty-state">
                <p>No recent activity yet.</p>

                <span>
                  Start adding tasks or study sessions
                  to see them here.
                </span>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map(
                  (activity, index) => (
                    <div
                      className="activity-item"
                      key={`${activity.type}-${index}`}
                    >
                      <div
                        className={`activity-dot ${
                          activity.type === "task"
                            ? "task-dot"
                            : "study-dot"
                        }`}
                      />

                      <div className="activity-content">
                        <strong>
                          {activity.title}
                        </strong>

                        <span>
                          {activity.description}
                        </span>
                      </div>

                      <time>
                        {formatDate(activity.date)}
                      </time>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="dashboard-section quick-actions">
            <div className="section-header">
              <div>
                <p className="section-label">
                  QUICK ACTIONS
                </p>

                <h2>Continue Learning</h2>
              </div>
            </div>

            <button
              className="action-button"
              onClick={goToTasks}
            >
              <span>
                <strong>Manage Tasks</strong>
                <small>
                  Add and complete your tasks
                </small>
              </span>

              <span className="arrow">
                →
              </span>
            </button>



            <button
              className="action-button"
              onClick={goToStudySessions}
            >
              <span>
                <strong>Start Study Session</strong>
                <small>
                  Track your study time
                </small>
              </span>

              <span className="arrow">
                →
              </span>
            </button>

            <button
              className="action-button"
              onClick={goToCodingPlatforms}
            >
              <span>
                <strong>Coding Platforms</strong>
                <small>
                  View your coding progress
                </small>
              </span>

              <span className="arrow">
                →
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;