import { useEffect, useState } from "react";
import "./Subjects.css";

function Subjects() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!student) {
      window.location.href = "/";
      return;
    }

    loadSubjects();
  }, []);

  const loadSubjects = () => {
    fetch(
      `http://localhost:8080/api/subjects/student/${student.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load subjects");
        }

        return response.json();
      })
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Subject loading error:", error);
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

    const subjectData = {
      name: formData.name,
      description: formData.description,
      studentId: student.id,
    };

    const url = editingSubjectId
      ? `http://localhost:8080/api/subjects/${editingSubjectId}`
      : "http://localhost:8080/api/subjects";

    const method = editingSubjectId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subjectData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            editingSubjectId
              ? "Unable to update subject"
              : "Unable to create subject"
          );
        }

        return response.json();
      })
      .then((savedSubject) => {
        if (editingSubjectId) {
          setSubjects(
            subjects.map((subject) =>
              subject.id === savedSubject.id
                ? savedSubject
                : subject
            )
          );
        } else {
          setSubjects([...subjects, savedSubject]);
        }

        setFormData({
          name: "",
          description: "",
        });

        setEditingSubjectId(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Subject save error:", error);
        alert(error.message);
      });
  };

  const startEditing = (subject) => {
    setFormData({
      name: subject.name,
      description: subject.description || "",
    });

    setEditingSubjectId(subject.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setFormData({
      name: "",
      description: "",
    });

    setEditingSubjectId(null);
    setShowForm(false);
  };

  const deleteSubject = (subjectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) {
      return;
    }

    fetch(
      `http://localhost:8080/api/subjects/${subjectId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to delete subject");
        }

        setSubjects(
          subjects.filter(
            (subject) => subject.id !== subjectId
          )
        );
      })
      .catch((error) => {
        console.error("Subject deletion error:", error);
        alert("Unable to delete subject");
      });
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const goToTasks = () => {
    window.location.href = "/tasks";
  };

  const logout = () => {
    localStorage.removeItem("student");
    window.location.href = "/";
  };

  if (!student) {
    return null;
  }

  return (
    <div className="subjects-page">

      <aside className="subjects-sidebar">

        <h2 className="subjects-logo">
          Study<span>Sync</span>
        </h2>

        <nav className="subjects-nav">

          <button onClick={goToDashboard}>
            Dashboard
          </button>

          <button onClick={goToTasks}>
            Tasks
          </button>

          <button className="active">
            Subjects
          </button>

          <button>
            Study Sessions
          </button>

          <button>
            Coding Platforms
          </button>

        </nav>

        <button
          className="logout-subject-button"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      <main className="subjects-main">

        <header className="subjects-header">

          <div>
            <h1>My Subjects</h1>

            <p>
              Manage your academic subjects
            </p>
          </div>

          <div className="subjects-header-buttons">

            <button
              className="add-subject-button"
              onClick={() => {
                if (showForm) {
                  cancelEditing();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? "Cancel" : "+ Add Subject"}
            </button>

            <button
              className="back-button"
              onClick={goToDashboard}
            >
              Dashboard
            </button>

          </div>

        </header>

        {showForm && (
          <form
            className="subject-form"
            onSubmit={handleSubmit}
          >

            <h2>
              {editingSubjectId
                ? "Edit Subject"
                : "Add New Subject"}
            </h2>

            <div className="form-group">

              <label>
                Subject Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Java"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: Java and Spring Boot"
              />

            </div>

            <button
              className="save-subject-button"
              type="submit"
            >
              {editingSubjectId
                ? "Update Subject"
                : "Create Subject"}
            </button>

          </form>
        )}

        {loading && (
          <div className="loading">
            Loading your subjects...
          </div>
        )}

        {!loading && subjects.length === 0 && (
          <div className="no-subjects">

            <h2>
              No subjects found
            </h2>

            <p>
              You currently don't have any subjects assigned.
            </p>

          </div>
        )}

        {!loading && subjects.length > 0 && (
          <section className="subject-grid">

            {subjects.map((subject) => (

              <div
                className="subject-card"
                key={subject.id}
              >

                <h2>
                  {subject.name}
                </h2>

                <p className="subject-description">
                  {subject.description ||
                    "No description provided."}
                </p>

                <div className="subject-actions">

                  <button
                    className="edit-subject-button"
                    onClick={() =>
                      startEditing(subject)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-subject-button"
                    onClick={() =>
                      deleteSubject(subject.id)
                    }
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

export default Subjects;