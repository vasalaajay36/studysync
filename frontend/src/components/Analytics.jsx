import { useCallback, useEffect, useState } from "react";
import "./Analytics.css";

function Analytics() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (period) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/analytics?days=${period}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? "Your session has expired. Please sign in again." : "Unable to load study analytics.");
      }
      setData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(7);
  }, [loadAnalytics]);

  const navigate = (path) => { window.location.href = path; };

  const formatMinutes = (minutes) => {
    const value = Number(minutes) || 0;
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const daily = data?.dailyStudy || [];
  const maxMinutes = Math.max(1, ...daily.map((item) => Number(item.minutes) || 0));

  return (
    <div className="analytics-page">
      <aside className="analytics-sidebar">
        <h2>Study<span>Sync</span></h2>
        <nav>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/tasks")}>Tasks</button>
          <button onClick={() => navigate("/subjects")}>Subjects</button>
          <button onClick={() => navigate("/study-sessions")}>Study Sessions</button>
          <button className="active">Study Analytics</button>
          <button onClick={() => navigate("/coding-platforms")}>Coding Platforms</button>
        </nav>
        <button className="logout" onClick={async () => {
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
        }}>Logout</button>
      </aside>

      <main className="analytics-main">
        <header className="analytics-header">
          <div>
            <p className="analytics-eyebrow">LEARNING INTELLIGENCE</p>
            <h1>Study Analytics</h1>
            <p>See where your study time is going and build a more consistent routine.</p>
          </div>
          <div className="analytics-period">
            {[7, 14, 30].map((period) => (
              <button
                key={period}
                className={days === period ? "selected" : ""}
                onClick={() => { setDays(period); loadAnalytics(period); }}
              >
                {period}d
              </button>
            ))}
          </div>
        </header>

        {error && <div className="analytics-error">{error}</div>}

        <section className="analytics-cards">
          <article><span>STUDY TIME</span><strong>{loading ? "—" : formatMinutes(data?.totalStudyMinutes)}</strong><small>completed focus time</small></article>
          <article><span>STUDY DAYS</span><strong>{loading ? "—" : data?.studyDays}</strong><small>days with completed sessions</small></article>
          <article><span>SESSIONS</span><strong>{loading ? "—" : data?.completedStudySessions}</strong><small>completed study sessions</small></article>
          <article><span>TASK RATE</span><strong>{loading ? "—" : `${data?.taskCompletionRate}%`}</strong><small>all-time task completion</small></article>
        </section>

        <section className="analytics-grid">
          <div className="analytics-panel">
            <div className="panel-heading">
              <div><p>CONSISTENCY</p><h2>Daily study time</h2></div>
              <span>{days} days</span>
            </div>
            <div className="bar-chart">
              {daily.map((item) => {
                const minutes = Number(item.minutes) || 0;
                const label = new Date(item.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });
                return (
                  <div className="bar-column" key={item.date} title={`${item.date}: ${minutes} min`}>
                    <div className="bar-value">{minutes > 0 ? minutes : ""}</div>
                    <div className="bar-track"><div className="bar-fill" style={{ height: `${(minutes / maxMinutes) * 100}%` }} /></div>
                    <small>{label}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="analytics-panel">
            <div className="panel-heading"><div><p>FOCUS AREAS</p><h2>Top study topics</h2></div></div>
            {(!data?.topTopics?.length && !loading) ? (
              <div className="analytics-empty">Complete a study session to start building topic analytics.</div>
            ) : (
              <div className="topic-list">
                {(data?.topTopics || []).map((topic, index) => (
                  <div className="topic-row" key={topic.topic}>
                    <span className="topic-rank">{index + 1}</span>
                    <div><strong>{topic.topic}</strong><small>{formatMinutes(topic.minutes)}</small></div>
                    <div className="topic-line"><span style={{ width: `${Math.max(8, (topic.minutes / Math.max(1, data.totalStudyMinutes)) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="analytics-tip">
          <strong>StudySync recommendation</strong>
          <span>Consistency beats occasional long sessions. Aim for at least one focused session on most days, then use Focus Mode to protect that time.</span>
          <button onClick={() => navigate("/study-sessions")}>Start Focus Mode →</button>
        </section>
      </main>
    </div>
  );
}

export default Analytics;
