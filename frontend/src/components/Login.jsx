import { useState } from "react";
import "./Login.css";

const API = "/api/auth";

function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const body = mode === "login"
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), course: course.trim(), password };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Unable to authenticate. Please check your details.");
      }

      localStorage.setItem("student", JSON.stringify(data));
      window.location.assign("/dashboard");
    } catch (error) {
      setMessage(error.message || "Unable to connect to StudySync.");
    } finally {
      setBusy(false);
    }
  };

  const changeMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setMessage("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">Study<span>Sync</span></div>
        <p className="auth-eyebrow">YOUR PERSONAL LEARNING SPACE</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to manage your tasks, subjects and study progress."
            : "Keep your academic work and coding progress in one place."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <>
              <label htmlFor="name">Full name</label>
              <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />

              <label htmlFor="course">Course / program</label>
              <input id="course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. B.Tech Artificial Intelligence" required maxLength={100} />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={190} />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 1} maxLength={72} />

          {message && <p className="auth-message" role="alert">{message}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New to StudySync?" : "Already have an account?"}{" "}
          <button type="button" onClick={changeMode}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="auth-footnote">Your password is stored as a secure hash, never as plain text.</p>
      </section>
    </main>
  );
}

export default Login;
