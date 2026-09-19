const API = "/api";

let studentId = 1;
let editingTaskId = null;
let editingTaskCompleted = false;
let editingSubjectId = null;

async function loadDashboard() {
    studentId = document.getElementById("studentId").value;
    if (!studentId) {
        alert("Please enter a student ID");
        return;
    }

    try {
        const response = await fetch(`${API}/dashboard/${studentId}`);
        if (!response.ok) throw new Error("Student not found");

        const data = await response.json();
        document.getElementById("welcome").textContent = `${data.studentName}'s Dashboard`;
        document.getElementById("totalSubjects").textContent = data.totalSubjects;
        document.getElementById("totalTasks").textContent = data.totalTasks;
        document.getElementById("completedTasks").textContent = data.completedTasks;
        document.getElementById("pendingTasks").textContent = data.pendingTasks;
        document.getElementById("totalSessions").textContent = data.totalStudySessions;
        document.getElementById("studyMinutes").textContent = data.totalStudyMinutes;

        await loadSubjects();
        await loadTasks();
        await loadSessions();
    } catch (error) {
        alert(error.message);
    }
}

// ===============================
// SUBJECTS
// ===============================

async function loadSubjects() {
    const response = await fetch(`${API}/subjects/student/${studentId}`);
    if (!response.ok) {
        document.getElementById("subjectsList").innerHTML = "<p>Failed to load subjects.</p>";
        return;
    }

    const subjects = await response.json();
    const container = document.getElementById("subjectsList");
    container.innerHTML = "";

    if (subjects.length === 0) {
        container.innerHTML = "<p>No subjects found. Add your first subject above.</p>";
        return;
    }

    subjects.forEach(subject => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <h3>${escapeHtml(subject.name)}</h3>
            <p>${escapeHtml(subject.description || "No description")}</p>
            <button onclick="startEditSubject(${subject.id}, '${escapeText(subject.name)}', '${escapeText(subject.description || "")}')">Edit</button>
            <button class="delete-btn" onclick="deleteSubject(${subject.id})">Delete</button>
        `;
        container.appendChild(div);
    });
}

function escapeText(text) {
    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

document.getElementById("subjectForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const subject = {
        name: document.getElementById("subjectName").value.trim(),
        description: document.getElementById("subjectDescription").value.trim(),
        studentId: Number(studentId)
    };

    const response = await fetch(`${API}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subject)
    });

    if (!response.ok) {
        alert("Failed to create subject");
        return;
    }

    alert("Subject added successfully");
    document.getElementById("subjectForm").reset();
    await loadDashboard();
});

function startEditSubject(id, name, description) {
    editingSubjectId = id;
    document.getElementById("editSubjectName").value = name;
    document.getElementById("editSubjectDescription").value = description;
    document.getElementById("editSubjectSection").style.display = "block";
    document.getElementById("editSubjectSection").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("editSubjectForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    if (!editingSubjectId) return;

    const subject = {
        name: document.getElementById("editSubjectName").value.trim(),
        description: document.getElementById("editSubjectDescription").value.trim(),
        studentId: Number(studentId)
    };

    const response = await fetch(`${API}/subjects/${editingSubjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subject)
    });

    if (!response.ok) {
        alert("Failed to update subject");
        return;
    }

    alert("Subject updated successfully");
    cancelSubjectEdit();
    await loadDashboard();
});

function cancelSubjectEdit() {
    editingSubjectId = null;
    document.getElementById("editSubjectForm").reset();
    document.getElementById("editSubjectSection").style.display = "none";
}

async function deleteSubject(id) {
    if (!confirm("Delete this subject?")) return;

    const response = await fetch(`${API}/subjects/${id}`, { method: "DELETE" });
    if (!response.ok) {
        alert("Failed to delete subject");
        return;
    }

    await loadDashboard();
}

// ===============================
// TASKS
// ===============================

async function loadTasks() {
    const response = await fetch(`${API}/tasks/student/${studentId}`);
    const tasks = await response.json();
    const container = document.getElementById("tasksList");
    container.innerHTML = "";

    if (tasks.length === 0) {
        container.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <h3 class="${task.completed ? "completed" : ""}">${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description || "No description")}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Status:</strong> ${task.completed ? "Completed" : "Pending"}</p>
            <button onclick="startEditTask(${task.id}, '${escapeText(task.title)}', '${escapeText(task.description || "")}', '${task.dueDate}', '${task.priority}', ${task.completed})">Edit</button>
            ${task.completed ? "" : `<button onclick="completeTask(${task.id}, '${escapeText(task.title)}', '${escapeText(task.description || "")}', '${task.dueDate}', '${task.priority}')">Mark Complete</button>`}
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        container.appendChild(div);
    });
}

document.getElementById("taskForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const task = {
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
        dueDate: document.getElementById("taskDueDate").value,
        priority: document.getElementById("taskPriority").value,
        completed: false,
        studentId: Number(studentId)
    };

    const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        alert("Failed to create task");
        return;
    }

    alert("Task added successfully");
    document.getElementById("taskForm").reset();
    await loadDashboard();
});

function startEditTask(id, title, description, dueDate, priority, completed) {
    editingTaskId = id;
    editingTaskCompleted = completed;
    document.getElementById("editTaskTitle").value = title;
    document.getElementById("editTaskDescription").value = description;
    document.getElementById("editTaskDueDate").value = dueDate;
    document.getElementById("editTaskPriority").value = priority;
    document.getElementById("editTaskSection").style.display = "block";
    document.getElementById("editTaskSection").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("editTaskForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    if (!editingTaskId) return;

    const task = {
        title: document.getElementById("editTaskTitle").value,
        description: document.getElementById("editTaskDescription").value,
        dueDate: document.getElementById("editTaskDueDate").value,
        priority: document.getElementById("editTaskPriority").value,
        completed: editingTaskCompleted,
        studentId: Number(studentId)
    };

    const response = await fetch(`${API}/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        alert("Failed to update task");
        return;
    }

    alert("Task updated successfully");
    cancelEdit();
    await loadDashboard();
});

function cancelEdit() {
    editingTaskId = null;
    editingTaskCompleted = false;
    document.getElementById("editTaskForm").reset();
    document.getElementById("editTaskSection").style.display = "none";
}

async function completeTask(id, title, description, dueDate, priority) {
    const task = { title, description, dueDate, priority, completed: true, studentId: Number(studentId) };
    const response = await fetch(`${API}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
    if (!response.ok) {
        alert("Failed to complete task");
        return;
    }
    await loadDashboard();
}

async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    const response = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    if (!response.ok) {
        alert("Failed to delete task");
        return;
    }
    await loadDashboard();
}

// ===============================
// STUDY SESSIONS
// ===============================

async function loadSessions() {
    const response = await fetch(`${API}/study-sessions/student/${studentId}`);
    const sessions = await response.json();
    const container = document.getElementById("sessionsList");
    container.innerHTML = "";

    if (sessions.length === 0) {
        container.innerHTML = "<p>No study sessions found.</p>";
        return;
    }

    sessions.forEach(session => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <h3>${escapeHtml(session.topic)}</h3>
            <p><strong>Date:</strong> ${session.date}</p>
            <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
            <button class="delete-btn" onclick="deleteSession(${session.id})">Delete</button>
        `;
        container.appendChild(div);
    });
}

document.getElementById("sessionForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const session = {
        topic: document.getElementById("sessionTopic").value,
        date: document.getElementById("sessionDate").value,
        durationMinutes: Number(document.getElementById("sessionDuration").value),
        studentId: Number(studentId)
    };

    const response = await fetch(`${API}/study-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session)
    });

    if (!response.ok) {
        alert("Failed to create study session");
        return;
    }

    alert("Study session added successfully");
    document.getElementById("sessionForm").reset();
    await loadDashboard();
});

async function deleteSession(id) {
    if (!confirm("Delete this study session?")) return;
    const response = await fetch(`${API}/study-sessions/${id}`, { method: "DELETE" });
    if (!response.ok) {
        alert("Failed to delete session");
        return;
    }
    await loadDashboard();
}

loadDashboard();