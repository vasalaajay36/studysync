import { useEffect, useState } from "react";
import "./Tasks.css";

function Tasks() {
  const studentData = localStorage.getItem("student");
  const student = studentData ? JSON.parse(studentData) : null;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    platform: "",
    completed: false,
  });

  useEffect(() => {
    if (!student) {
      window.location.href = "/";
      return;
    }

    loadTasks();
  }, []);

  const loadTasks = () => {
    fetch(
      `http://localhost:8080/api/tasks/student/${student.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load tasks");
        }

        return response.json();
      })
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Task loading error:", error);
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "MEDIUM",
      platform: "",
      completed: false,
    });

    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const taskData = {
      ...formData,
      studentId: student.id,
    };

    const url = editingTask
      ? `http://localhost:8080/api/tasks/${editingTask.id}`
      : "http://localhost:8080/api/tasks";

    const method = editingTask ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            editingTask
              ? "Unable to update task"
              : "Unable to create task"
          );
        }

        return response.json();
      })
      .then((savedTask) => {
        if (editingTask) {
          setTasks(
            tasks.map((task) =>
              task.id === savedTask.id
                ? savedTask
                : task
            )
          );
        } else {
          setTasks([...tasks, savedTask]);
        }

        resetForm();
      })
      .catch((error) => {
        console.error("Task save error:", error);
        alert("Unable to save task");
      });
  };

  const editTask = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "MEDIUM",
      platform: task.platform || "",
      completed: task.completed || false,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleTaskStatus = (task) => {
    const updatedTask = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      platform: task.platform,
      completed: !task.completed,
      studentId: student.id,
    };

    fetch(
      `http://localhost:8080/api/tasks/${task.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to update task");
        }

        return response.json();
      })
      .then((updatedTaskFromServer) => {
        setTasks(
          tasks.map((currentTask) =>
            currentTask.id === updatedTaskFromServer.id
              ? updatedTaskFromServer
              : currentTask
          )
        );
      })
      .catch((error) => {
        console.error("Task update error:", error);
        alert("Unable to update task");
      });
  };

  const deleteTask = (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    fetch(
      `http://localhost:8080/api/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to delete task");
        }

        setTasks(
          tasks.filter((task) => task.id !== taskId)
        );
      })
      .catch((error) => {
        console.error("Task deletion error:", error);
        alert("Unable to delete task");
      });
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const logout = () => {
    localStorage.removeItem("student");
    window.location.href = "/";
  };

  if (!student) {
    return null;
  }

  return (
    <div className="tasks-page">

      <aside className="tasks-sidebar">

        <h2 className="tasks-logo">
          Study<span>Sync</span>
        </h2>

        <nav className="tasks-nav">

          <button onClick={goToDashboard}>
            Dashboard
          </button>

          <button className="active">
            Tasks
          </button>

          <button>
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
          className="logout-task-button"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      <main className="tasks-main">

        <header className="tasks-header">

          <div>
            <h1>My Tasks</h1>

            <p>
              Manage your academic and coding tasks
            </p>
          </div>

          <div className="tasks-header-buttons">

            <button
              className="add-task-button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? "Cancel" : "+ Add Task"}
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
            className="task-form"
            onSubmit={handleSubmit}
          >

            <h2>
              {editingTask
                ? "Edit Task"
                : "Add New Task"}
            </h2>

            <div className="form-group">

              <label>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />

            </div>

            <div className="form-group">

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
              />

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Due Date</label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>Priority</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="LOW">
                    LOW
                  </option>
                </select>

              </div>

            </div>

            <div className="form-group">

              <label>Platform</label>

              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="Example: LeetCode, Spring Boot"
              />

            </div>

            <div className="form-buttons">

              <button
                className="save-task-button"
                type="submit"
              >
                {editingTask
                  ? "Update Task"
                  : "Create Task"}
              </button>

              {editingTask && (
                <button
                  className="cancel-edit-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        )}

        {loading && (
          <div className="loading">
            Loading your tasks...
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="no-tasks">

            <h2>No tasks found</h2>

            <p>
              You currently don't have any tasks assigned.
            </p>

          </div>
        )}

        {!loading && tasks.length > 0 && (
          <section className="task-grid">

            {tasks.map((task) => (

              <div
                className="task-card"
                key={task.id}
              >

                <h2>{task.title}</h2>

                <p className="task-description">
                  {task.description ||
                    "No description provided."}
                </p>

                <div className="task-details">

                  <div>
                    <strong>Due date:</strong>{" "}
                    {task.dueDate}
                  </div>

                  <div>

                    <strong>Priority:</strong>{" "}

                    <span
                      className={
                        task.priority === "HIGH"
                          ? "priority-high"
                          : task.priority === "MEDIUM"
                          ? "priority-medium"
                          : "priority-low"
                      }
                    >
                      {task.priority}
                    </span>

                  </div>

                  <div>

                    <strong>Platform:</strong>{" "}

                    {task.platform || "General"}

                  </div>

                  <div>

                    <strong>Status:</strong>{" "}

                    <button
                      className={
                        task.completed
                          ? "completed status-button"
                          : "pending status-button"
                      }
                      onClick={() =>
                        toggleTaskStatus(task)
                      }
                    >
                      {task.completed
                        ? "Completed"
                        : "Pending"}
                    </button>

                  </div>

                  <button
                    className="edit-task-button"
                    onClick={() =>
                      editTask(task)
                    }
                  >
                    Edit Task
                  </button>

                  <button
                    className="delete-task-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete Task
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

export default Tasks;