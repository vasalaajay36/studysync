import { useEffect, useState } from "react";
import "./StudySessions.css";

function StudySessions() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    studyDate: "",
    durationMinutes: "",
  });

  useEffect(() => {
    if (!student) {
      window.location.href = "/";
      return;
    }

    loadSessions();
  }, []);

  const loadSessions = () => {
    fetch(
      `http://localhost:8080/api/study-sessions/student/${student.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load study sessions");
        }

        return response.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Study session loading error:", error);
        setLoading(false);
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const sessionData = {
      topic: formData.topic,
      description: formData.description,
      studyDate: formData.studyDate,
      durationMinutes: Number(formData.durationMinutes),
      completed: false,
      studentId: student.id,
    };

    fetch("http://localhost:8080/api/study-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to create study session");
        }

        return response.json();
      })
      .then((newSession) => {
        setSessions((currentSessions) => [
          ...currentSessions,
          newSession,
        ]);

        setFormData({
          topic: "",
          description: "",
          studyDate: "",
          durationMinutes: "",
        });

        setShowForm(false);
      })
      .catch((error) => {
        console.error("Study session creation error:", error);
        alert("Unable to create study session");
      });
  };

  const toggleSessionStatus = (session) => {
    const updatedSession = {
      topic: session.topic,
      description: session.description,
      studyDate: session.studyDate,
      durationMinutes: session.durationMinutes,
      completed: !session.completed,
      studentId: student.id,
    };

    fetch(
      `http://localhost:8080/api/study-sessions/${session.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSession),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to update study session");
        }

        return response.json();
      })
      .then((updatedSessionFromServer) => {
        setSessions((currentSessions) =>
          currentSessions.map((currentSession) =>
            currentSession.id === updatedSessionFromServer.id
              ? updatedSessionFromServer
              : currentSession
          )
        );
      })
      .catch((error) => {
        console.error("Study session update error:", error);
        alert("Unable to update study session");
      });
  };

  const deleteSession = (sessionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study session?"
    );

    if (!confirmed) {
      return;
    }

    fetch(
      `http://localhost:8080/api/study-sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to delete study session");
        }

        setSessions((currentSessions) =>
          currentSessions.filter(
            (session) => session.id !== sessionId
          )
        );
      })
      .catch((error) => {
        console.error("Study session deletion error:", error);
        alert("Unable to delete study session");
      });
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

  const logout = () => {
    localStorage.removeItem("student");
    window.location.href = "/";
  };

  if (!student) {
    return null;
  }

  return (
    <div className="study-sessions-page">

      <aside className="study-sidebar">

        <h2 className="study-logo">
          Study<span>Sync</span>
        </h2>

        <nav className="study-nav">

          <button onClick={goToDashboard}>
            Dashboard
          </button>

          <button onClick={goToTasks}>
            Tasks
          </button>

          <button onClick={goToSubjects}>
            Subjects
          </button>

          <button className="active">
            Study Sessions
          </button>

          <button>
            Coding Platforms
          </button>

        </nav>

        <button
          className="logout-study-button"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      <main className="study-main">

        <header className="study-header">

          <div>
            <h1>Study Sessions</h1>

            <p>
              Track your study time and progress
            </p>
          </div>

          <div className="study-header-buttons">

            <button
              className="add-session-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Add Session"}
            </button>

            <button
              className="back-study-button"
              onClick={goToDashboard}
            >
              Dashboard
            </button>

          </div>

        </header>

        {showForm && (
          <form
            className="study-form"
            onSubmit={handleSubmit}
          >

            <h2>Add Study Session</h2>

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
                placeholder="What did you study?"
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

                <label>Duration (minutes)</label>

                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  placeholder="60"
                  min="1"
                  required
                />

              </div>

            </div>

            <button
              className="save-session-button"
              type="submit"
            >
              Create Session
            </button>

          </form>
        )}

        {loading && (
          <div className="study-loading">
            Loading your study sessions...
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="no-sessions">

            <h2>No study sessions found</h2>

            <p>
              Start tracking your study sessions.
            </p>

          </div>
        )}

        {!loading && sessions.length > 0 && (
          <section className="session-grid">

            {sessions.map((session) => (

              <div
                className="session-card"
                key={session.id}
              >

                <h2>{session.topic}</h2>

                <p className="session-description">
                  {session.description ||
                    "No description provided."}
                </p>

                <div className="session-details">

                  <div>
                    <strong>Date:</strong>{" "}
                    {session.studyDate}
                  </div>

                  <div>
                    <strong>Duration:</strong>{" "}
                    {session.durationMinutes} minutes
                  </div>

                  <div>
                    <strong>Status:</strong>{" "}

                    <button
                      className={
                        session.completed
                          ? "session-completed session-status-button"
                          : "session-pending session-status-button"
                      }
                      onClick={() =>
                        toggleSessionStatus(session)
                      }
                    >
                      {session.completed
                        ? "Completed"
                        : "Pending"}
                    </button>

                  </div>

                  <button
                    className="delete-session-button"
                    onClick={() =>
                      deleteSession(session.id)
                    }
                  >
                    Delete Session
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
