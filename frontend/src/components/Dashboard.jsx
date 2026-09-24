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
      ] = await Promise.all([
        fetch(`http://localhost:8080/api/dashboard/${studentId}`, {
          credentials: "include",
        }),

        fetch(
          `http://localhost:8080/api/tasks/student/${studentId}`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `http://localhost:8080/api/study-sessions/student/${studentId}`,
          {
            credentials: "include",
          }
        ),

        fetch("http://localhost:8080/api/coding-platforms", {
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

      const dashboardData = await dashboardResponse.json();
      const tasks = await tasksResponse.json();
      const studySessions = await studySessionsResponse.json();
      const codingPlatforms = await codingPlatformsResponse.json();

      setStats({
        totalSubjects: dashboardData.totalSubjects || 0,
        totalTasks: dashboardData.totalTasks || 0,
        completedTasks: dashboardData.completedTasks || 0,
        pendingTasks: dashboardData.pendingTasks || 0,
        totalStudySessions: dashboardData.totalStudySessions || 0,
        totalStudyMinutes: dashboardData.totalStudyMinutes || 0,
      });

      setCodingPlatformCount(
        Array.isArray(codingPlatforms)
          ? codingPlatforms.length
          : 0
      );

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

  const goToSubjects = () => {
    window.location.href = "/subjects";
  };

  const goToStudySessions = () => {
    window.location.href = "/study-sessions";
  };

  const goToCodingPlatforms = () => {
    window.location.href = "/coding-platforms";
  };

  const logout = () => {
    localStorage.removeItem("student");
    window.location.href = "/";
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
              onClick={goToSubjects}
            >
              <span className="nav-icon">▣</span>
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
              Manage your subjects, complete your tasks,
              record study sessions and keep your coding
              platforms connected.
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
            onClick={goToSubjects}
          >
            <div className="stat-card-top">
              <span className="stat-icon subject-icon">
                ▣
              </span>

              <span className="stat-label">
                SUBJECTS
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.totalSubjects}
            </strong>

            <small>
              Subjects you're currently studying
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
              onClick={goToSubjects}
            >
              <span>
                <strong>Manage Subjects</strong>
                <small>
                  Organize your subjects
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