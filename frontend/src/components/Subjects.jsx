import { useEffect, useState } from "react";
import "./Subjects.css";

function Subjects() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;
  const studentId = student?.id ?? null;
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!studentId) {
      window.location.replace("/");
      return;
    }

    let active = true;
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/subjects");
        if (!response.ok) throw new Error("Unable to load subjects");
        const data = await response.json();
        if (active) setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Subject loading error:", error);
        if (active) alert(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSubjects();
    return () => { active = false; };
  }, [studentId]);

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingSubjectId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...formData, studentId: student.id };
    const url = editingSubjectId ? `/api/subjects/${editingSubjectId}` : "/api/subjects";
    const method = editingSubjectId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to save subject");

      setSubjects((current) =>
        editingSubjectId
          ? current.map((subject) => subject.id === data.id ? data : subject)
          : [...current, data]
      );
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const startEditing = (subject) => {
    setFormData({ name: subject.name || "", description: subject.description || "" });
    setEditingSubjectId(subject.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      const response = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete subject");
      setSubjects((current) => current.filter((subject) => subject.id !== id));
    } catch (error) {
      alert(error.message);
    }
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

  const navigate = (path) => { window.location.href = path; };

  if (!student) return null;

  return (
    <div className="subjects-page">
      <aside className="subjects-sidebar">
        <h2 className="subjects-logo">Study<span>Sync</span></h2>
        <nav className="subjects-nav">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/tasks")}>Tasks</button>
          <button className="active">Subjects</button>
          <button onClick={() => navigate("/study-sessions")}>Study Sessions</button>
          <button onClick={() => navigate("/coding-platforms")}>Coding Platforms</button>
          <button onClick={() => navigate("/analytics")}>Study Analytics</button>
        </nav>
        <button className="logout-subject-button" onClick={logout}>Logout</button>
      </aside>

      <main className="subjects-main">
        <header className="subjects-header">
          <div>
            <h1>My Subjects</h1>
            <p>Manage your academic subjects</p>
          </div>
          <div className="subjects-header-buttons">
            <button className="add-subject-button" onClick={() => showForm ? resetForm() : setShowForm(true)}>
              {showForm ? "Cancel" : "+ Add Subject"}
            </button>
            <button className="back-button" onClick={() => navigate("/dashboard")}>Dashboard</button>
          </div>
        </header>

        {showForm && (
          <form className="subject-form" onSubmit={handleSubmit}>
            <h2>{editingSubjectId ? "Edit Subject" : "Add New Subject"}</h2>
            <div className="form-group">
              <label>Subject Name</label>
              <input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Example: Java" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Example: Java and Spring Boot" />
            </div>
            <button className="save-subject-button" type="submit">
              {editingSubjectId ? "Update Subject" : "Create Subject"}
            </button>
          </form>
        )}

        {loading && <div className="loading">Loading your subjects...</div>}

        {!loading && subjects.length === 0 && (
          <div className="no-subjects">
            <h2>No subjects found</h2>
            <p>Add your first subject to start organizing your studies.</p>
          </div>
        )}

        {!loading && subjects.length > 0 && (
          <section className="subject-grid">
            {subjects.map((subject) => (
              <div className="subject-card" key={subject.id}>
                <h2>{subject.name}</h2>
                <p className="subject-description">{subject.description || "No description provided."}</p>
                <div className="subject-actions">
                  <button className="edit-subject-button" onClick={() => startEditing(subject)}>Edit</button>
                  <button className="delete-subject-button" onClick={() => deleteSubject(subject.id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Subjects;
