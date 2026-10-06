import { useEffect, useMemo, useState } from "react";
import "./StudySessions.css";
import {
  BLOCKS_BEFORE_LONG_BREAK,
  FOCUS_BLOCK_MINUTES,
  LONG_BREAK_MINUTES,
  SHORT_BREAK_MINUTES,
  formatTimer,
  notifyTimer,
  requestTimerNotificationPermission,
} from "./StudyTimer.jsx";

const EMPTY_FORM = {
  topic: "",
  description: "",
  studyDate: "",
  durationMinutes: "",
};

function StudySessions() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [timerMode, setTimerMode] = useState("focus");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [focusBlocks, setFocusBlocks] = useState(0);
  const [elapsedFocusMinutes, setElapsedFocusMinutes] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  useEffect(() => {
    if (!student) {
      window.location.href = "/";
      return;
    }

    loadSessions();
    requestTimerNotificationPermission();
  }, []);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          finishTimerPhase();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/study-sessions", {
        credentials: "include",
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : data?.message || `Unable to load study sessions (HTTP ${response.status}).`
        );
      }

      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Study session loading error:", error);
      setErrorMessage(error.message || "Unable to load study sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const sessionData = {
      topic: formData.topic.trim(),
      description: formData.description.trim(),
      studyDate: formData.studyDate,
      durationMinutes: Number(formData.durationMinutes),
      completed: false,
      studentId: student.id,
    };

    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data?.message || `Unable to create study session (HTTP ${response.status}).`);
      }

      setSessions((current) => [...current, data]);
      setFormData(EMPTY_FORM);
      setShowForm(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Study session creation error:", error);
      setErrorMessage(error.message || "Unable to create study session.");
    }
  };

  const toggleSessionStatus = async (session) => {
    const updatedSession = {
      topic: session.topic,
      description: session.description,
      studyDate: session.studyDate,
      durationMinutes: session.durationMinutes,
      completed: !session.completed,
      studentId: student.id,
    };

    try {
      const response = await fetch(`/api/study-sessions/${session.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSession),
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update study session");
      }

      setSessions((current) =>
        current.map((item) => (item.id === data.id ? data : item))
      );
    } catch (error) {
      console.error("Study session update error:", error);
      setErrorMessage(error.message || "Unable to update study session.");
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this study session?")) {
      return;
    }

    try {
      const response = await fetch(`/api/study-sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to delete study session");
      }

      if (activeSessionId === sessionId) {
        stopTimer();
      }

      setSessions((current) => current.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Study session deletion error:", error);
      setErrorMessage(error.message || "Unable to delete study session.");
    }
  };

  const startTimerForSession = async (session) => {
    await requestTimerNotificationPermission();

    const totalMinutes = Math.max(1, Number(session.durationMinutes) || 1);
    const firstBlockMinutes = Math.min(FOCUS_BLOCK_MINUTES, totalMinutes);

    setActiveSessionId(session.id);
    setTimerMode("focus");
    setTimerSeconds(firstBlockMinutes * 60);
    setTimerRunning(true);
    setFocusBlocks(0);
    setElapsedFocusMinutes(0);
    setBreakSeconds(0);
    setErrorMessage("");
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setActiveSessionId(null);
    setTimerSeconds(0);
    setTimerMode("focus");
    setFocusBlocks(0);
    setElapsedFocusMinutes(0);
    setBreakSeconds(0);
  };

  const finishTimerPhase = () => {
    setTimerRunning(false);

    if (timerMode === "break") {
      notifyTimer("Break finished", "Your break is over. Ready for another focused block?");
      setTimerMode("focus");
      const remainingMinutes = Math.max(
        1,
        (activeSession?.durationMinutes || FOCUS_BLOCK_MINUTES) - elapsedFocusMinutes
      );
      setTimerSeconds(Math.min(FOCUS_BLOCK_MINUTES, remainingMinutes) * 60);
      setBreakSeconds(0);
      return;
    }

    const nextBlocks = focusBlocks + 1;
    const remainingMinutes = Math.max(
      0,
      (activeSession?.durationMinutes || FOCUS_BLOCK_MINUTES) - elapsedFocusMinutes
    );
    const completedBlockMinutes = Math.min(
      FOCUS_BLOCK_MINUTES,
      remainingMinutes
    );
    const nextElapsed = elapsedFocusMinutes + completedBlockMinutes;

    setFocusBlocks(nextBlocks);
    setElapsedFocusMinutes(nextElapsed);

    if (activeSession && nextElapsed >= activeSession.durationMinutes) {
      notifyTimer("Study session complete", `Great work on ${activeSession.topic}!`);
      setTimerSeconds(0);
      setTimerMode("complete");
      toggleSessionStatus(activeSession);
      return;
    }

    const longBreak = nextBlocks % BLOCKS_BEFORE_LONG_BREAK === 0;
    const breakMinutes = longBreak ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES;

    setTimerMode("break");
    setBreakSeconds(breakMinutes * 60);
    setTimerSeconds(breakMinutes * 60);
    notifyTimer(
      longBreak ? "Long break time" : "Break time",
      `${longBreak ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES} minutes. Step away and recharge.`
    );
  };

  const toggleTimer = () => {
    if (!activeSession || timerMode === "complete") return;
    setTimerRunning((running) => !running);
  };

  const skipBreak = () => {
    if (timerMode !== "break") return;

    setTimerRunning(false);
    setTimerMode("focus");
    const remainingMinutes = Math.max(
      1,
      (activeSession?.durationMinutes || FOCUS_BLOCK_MINUTES) - elapsedFocusMinutes
    );
    setTimerSeconds(Math.min(FOCUS_BLOCK_MINUTES, remainingMinutes) * 60);
    setBreakSeconds(0);
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

  const goToCodingPlatforms = () => {
    window.location.href = "/coding-platforms";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("student");
      window.location.assign("/");
    }
  };

  if (!student) return null;

  return (
    <div className="study-sessions-page">
      <aside className="study-sidebar">
        <h2 className="study-logo">
          Study<span>Sync</span>
        </h2>

        <nav className="study-nav">
          <button onClick={goToDashboard}>Dashboard</button>
          <button onClick={goToTasks}>Tasks</button>
          <button onClick={goToSubjects}>Subjects</button>
          <button className="active">Study Sessions</button>
          <button onClick={goToCodingPlatforms}>Coding Platforms</button>
        </nav>

        <button className="logout-study-button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="study-main">
        <header className="study-header">
          <div>
            <div className="study-eyebrow">FOCUS MODE</div>
            <h1>Study Sessions</h1>
            <p>Plan your study time, focus in blocks, and take breaks before burnout.</p>
          </div>

          <div className="study-header-buttons">
            <button
              className="add-session-button"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? "Cancel" : "+ Add Session"}
            </button>
            <button className="back-study-button" onClick={goToDashboard}>
              Dashboard
            </button>
          </div>
        </header>

        {errorMessage && <div className="study-error">{errorMessage}</div>}

        {activeSession && (
          <section className={`focus-panel ${timerMode}`}>
            <div className="focus-panel-top">
              <div>
                <span className="focus-label">
                  {timerMode === "focus" && "FOCUS BLOCK"}
                  {timerMode === "break" && "BREAK"}
                  {timerMode === "complete" && "SESSION COMPLETE"}
                </span>
                <h2>{activeSession.topic}</h2>
                <p>
                  {timerMode === "focus"
                    ? "Stay focused. Your next break will be scheduled automatically."
                    : timerMode === "break"
                      ? "Step away from the screen, stretch, hydrate, and come back refreshed."
                      : "You completed the planned study time. Excellent work."}
                </p>
              </div>

              <div className="timer-circle">
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            <div className="focus-progress">
              <div className="focus-progress-bar">
                <div
                  className="focus-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      ((elapsedFocusMinutes +
                        (timerMode === "focus"
                          ? Math.max(
                              0,
                              FOCUS_BLOCK_MINUTES -
                                Math.floor(timerSeconds / 60)
                            )
                          : 0)) /
                        activeSession.durationMinutes) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <div className="focus-progress-meta">
                <span>{Math.min(elapsedFocusMinutes, activeSession.durationMinutes)} / {activeSession.durationMinutes} min studied</span>
                <span>{focusBlocks} focus block{focusBlocks === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div className="focus-controls">
              {timerMode !== "complete" && (
                <button className="timer-primary" onClick={toggleTimer}>
                  {timerRunning ? "Pause Timer" : timerMode === "break" ? "Resume Break" : "Start Timer"}
                </button>
              )}

              {timerMode === "break" && (
                <button className="timer-secondary" onClick={skipBreak}>
                  Skip Break
                </button>
              )}

              <button className="timer-secondary" onClick={stopTimer}>
                Stop
              </button>
            </div>

            <div className="break-rule">
              <strong>Break plan:</strong> {FOCUS_BLOCK_MINUTES} min focus → {SHORT_BREAK_MINUTES} min break · after {BLOCKS_BEFORE_LONG_BREAK} blocks → {LONG_BREAK_MINUTES} min long break
            </div>
          </section>
        )}

        {showForm && (
          <form className="study-form" onSubmit={handleSubmit}>
            <h2>Create a Study Session</h2>
            <p className="form-help">
              Set the total time you want to study. StudySync will guide you through focus blocks and breaks.
            </p>

            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Example: Java Collections"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What do you want to accomplish?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Study Date</label>
                <input
                  type="date"
                  name="studyDate"
                  value={formData.studyDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Focus Time (minutes)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  placeholder="120"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="timer-tip">
              <strong>Recommended:</strong> use at least 50 minutes for a full focus block. Longer sessions automatically receive short and long breaks.
            </div>

            <button className="save-session-button" type="submit">
              Create Session
            </button>
          </form>
        )}

        {loading && <div className="study-loading">Loading your study sessions...</div>}

        {!loading && sessions.length === 0 && (
          <div className="no-sessions">
            <h2>No study sessions found</h2>
            <p>Create your first session and start a guided focus timer.</p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <section className="session-grid">
            {sessions.map((session) => (
              <div className={`session-card ${session.completed ? "is-completed" : ""}`} key={session.id}>
                <div className="session-card-heading">
                  <div>
                    <span className="session-date">{session.studyDate}</span>
                    <h2>{session.topic}</h2>
                  </div>
                  <span className={session.completed ? "status-pill completed" : "status-pill pending"}>
                    {session.completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <p className="session-description">
                  {session.description || "No description provided."}
                </p>

                <div className="session-details">
                  <span>{session.durationMinutes} min planned</span>
                  <span>{session.completed ? "Nice work." : "Ready to study."}</span>
                </div>

                <div className="session-actions">
                  {!session.completed && (
                    <button
                      className="start-session-button"
                      onClick={() => startTimerForSession(session)}
                    >
                      {activeSessionId === session.id ? "Restart Timer" : "Start Focus Timer"}
                    </button>
                  )}

                  <button
                    className="session-status-button"
                    onClick={() => toggleSessionStatus(session)}
                  >
                    {session.completed ? "Mark Pending" : "Mark Complete"}
                  </button>

                  <button
                    className="delete-session-button"
                    onClick={() => deleteSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default StudySessions;
