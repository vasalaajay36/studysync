const API = "/api";

let studentId = 1;
let editingTaskId = null;
let editingTaskCompleted = false;
let editingSubjectId = null;

async function loadDashboard() {
    studentId = document.getElementById("studentId").value;
    if (!studentId) { alert("Please enter a student ID"); return; }

    try {
        const response = await fetch(`${API}/dashboard/${studentId}`);
        if (!response.ok) throw new Error("Student not found");
        const data = await response.json();

        document.getElementById("welcome").textContent = `Welcome back, ${data.studentName}`;
        document.getElementById("totalSubjects").textContent = data.totalSubjects;
        document.getElementById("totalTasks").textContent = data.totalTasks;
        document.getElementById("completedTasks").textContent = `${data.completedTasks} / ${data.totalTasks}`;
        document.getElementById("pendingTasks").textContent = data.pendingTasks;
        document.getElementById("totalSessions").textContent = data.totalStudySessions;
        document.getElementById("studyMinutes").textContent = data.totalStudyMinutes;

        setText("totalStudents", 1);
        setText("completedTasksMini", data.completedTasks);
        setText("pendingTasksMini", data.pendingTasks);
        setText("studyMinutesMini", data.totalStudyMinutes);
        setText("subjectsMini", data.totalSubjects);

        const completion = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
        setText("progressPercent", `${completion}%`);
        setProgress("taskProgressBar", completion);
        setProgress("pendingProgressBar", data.totalTasks > 0 ? Math.round((data.pendingTasks / data.totalTasks) * 100) : 0);
        setProgress("studyProgressBar", Math.min(100, Math.round((data.totalStudyMinutes / 600) * 100)));
        const ring = document.querySelector(".progress-ring");
        if (ring) ring.style.background = `conic-gradient(#38b99b ${completion * 3.6}deg, #e4eaf4 ${completion * 3.6}deg)`;

        await loadSubjects();
        await loadTasks();
        await loadSessions();
    } catch (error) { alert(error.message); }
}

function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function setProgress(id, percent) { const el = document.getElementById(id); if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`; }

// SUBJECTS
async function loadSubjects() {
    const response = await fetch(`${API}/subjects/student/${studentId}`);
    if (!response.ok) { document.getElementById("subjectsList").innerHTML = "<p>Failed to load subjects.</p>"; return; }
    const subjects = await response.json();
    const container = document.getElementById("subjectsList"); container.innerHTML = "";
    if (subjects.length === 0) { container.innerHTML = "<p>No subjects found. Add your first subject above.</p>"; return; }
    subjects.forEach(subject => {
        const div = document.createElement("div"); div.className = "item";
        div.innerHTML = `<h3>${escapeHtml(subject.name)}</h3><p>${escapeHtml(subject.description || "No description")}</p><button onclick="startEditSubject(${subject.id}, '${escapeText(subject.name)}', '${escapeText(subject.description || "")}')">Edit</button><button class="delete-btn" onclick="deleteSubject(${subject.id})">Delete</button>`;
        container.appendChild(div);
    });
}
function escapeText(text) { return String(text).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n").replace(/\r/g,"\\r"); }
function escapeHtml(text) { const div=document.createElement("div"); div.textContent=String(text); return div.innerHTML; }

document.getElementById("subjectForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const subject={name:document.getElementById("subjectName").value.trim(),description:document.getElementById("subjectDescription").value.trim(),studentId:Number(studentId)};
    const response=await fetch(`${API}/subjects`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(subject)});
    if(!response.ok){alert("Failed to create subject");return;} alert("Subject added successfully"); document.getElementById("subjectForm").reset(); await loadDashboard();
});
function startEditSubject(id,name,description){editingSubjectId=id;document.getElementById("editSubjectName").value=name;document.getElementById("editSubjectDescription").value=description;document.getElementById("editSubjectSection").style.display="block";document.getElementById("editSubjectSection").scrollIntoView({behavior:"smooth"});}
document.getElementById("editSubjectForm").addEventListener("submit",async function(event){event.preventDefault();if(!editingSubjectId)return;const subject={name:document.getElementById("editSubjectName").value.trim(),description:document.getElementById("editSubjectDescription").value.trim(),studentId:Number(studentId)};const response=await fetch(`${API}/subjects/${editingSubjectId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(subject)});if(!response.ok){alert("Failed to update subject");return;}alert("Subject updated successfully");cancelSubjectEdit();await loadDashboard();});
function cancelSubjectEdit(){editingSubjectId=null;document.getElementById("editSubjectForm").reset();document.getElementById("editSubjectSection").style.display="none";}
async function deleteSubject(id){if(!confirm("Delete this subject?"))return;const response=await fetch(`${API}/subjects/${id}`,{method:"DELETE"});if(!response.ok){alert("Failed to delete subject");return;}await loadDashboard();}

// TASKS
async function loadTasks(){const response=await fetch(`${API}/tasks/student/${studentId}`);const tasks=await response.json();const container=document.getElementById("tasksList");container.innerHTML="";if(tasks.length===0){container.innerHTML="<p>No tasks found.</p>";return;}tasks.forEach(task=>{const div=document.createElement("div");div.className="item";div.innerHTML=`<h3 class="${task.completed?"completed":""}">${escapeHtml(task.title)}</h3><p>${escapeHtml(task.description||"No description")}</p><p><strong>Due:</strong> ${task.dueDate}</p><p><strong>Priority:</strong> ${task.priority}</p><p><strong>Status:</strong> ${task.completed?"Completed":"Pending"}</p><button onclick="startEditTask(${task.id}, '${escapeText(task.title)}', '${escapeText(task.description||"")}', '${task.dueDate}', '${task.priority}', ${task.completed})">Edit</button>${task.completed?"":`<button onclick="completeTask(${task.id}, '${escapeText(task.title)}', '${escapeText(task.description||"")}', '${task.dueDate}', '${task.priority}')">Mark Complete</button>`}<button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>`;container.appendChild(div);});}
document.getElementById("taskForm").addEventListener("submit",async function(event){event.preventDefault();const task={title:document.getElementById("taskTitle").value,description:document.getElementById("taskDescription").value,dueDate:document.getElementById("taskDueDate").value,priority:document.getElementById("taskPriority").value,completed:false,studentId:Number(studentId)};const response=await fetch(`${API}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(task)});if(!response.ok){alert("Failed to create task");return;}alert("Task added successfully");document.getElementById("taskForm").reset();await loadDashboard();});
function startEditTask(id,title,description,dueDate,priority,completed){editingTaskId=id;editingTaskCompleted=completed;document.getElementById("editTaskTitle").value=title;document.getElementById("editTaskDescription").value=description;document.getElementById("editTaskDueDate").value=dueDate;document.getElementById("editTaskPriority").value=priority;document.getElementById("editTaskSection").style.display="block";document.getElementById("editTaskSection").scrollIntoView({behavior:"smooth"});}
document.getElementById("editTaskForm").addEventListener("submit",async function(event){event.preventDefault();if(!editingTaskId)return;const task={title:document.getElementById("editTaskTitle").value,description:document.getElementById("editTaskDescription").value,dueDate:document.getElementById("editTaskDueDate").value,priority:document.getElementById("editTaskPriority").value,completed:editingTaskCompleted,studentId:Number(studentId)};const response=await fetch(`${API}/tasks/${editingTaskId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(task)});if(!response.ok){alert("Failed to update task");return;}alert("Task updated successfully");cancelEdit();await loadDashboard();});
function cancelEdit(){editingTaskId=null;editingTaskCompleted=false;document.getElementById("editTaskForm").reset();document.getElementById("editTaskSection").style.display="none";}
async function completeTask(id,title,description,dueDate,priority){const task={title,description,dueDate,priority,completed:true,studentId:Number(studentId)};const response=await fetch(`${API}/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(task)});if(!response.ok){alert("Failed to complete task");return;}await loadDashboard();}
async function deleteTask(id){if(!confirm("Delete this task?"))return;const response=await fetch(`${API}/tasks/${id}`,{method:"DELETE"});if(!response.ok){alert("Failed to delete task");return;}await loadDashboard();}

// STUDY SESSIONS
async function loadSessions(){const response=await fetch(`${API}/study-sessions/student/${studentId}`);const sessions=await response.json();const container=document.getElementById("sessionsList");container.innerHTML="";if(sessions.length===0){container.innerHTML="<p>No study sessions found.</p>";return;}sessions.forEach(session=>{const div=document.createElement("div");div.className="item";div.innerHTML=`<h3>${escapeHtml(session.topic)}</h3><p><strong>Date:</strong> ${session.date}</p><p><strong>Duration:</strong> ${session.durationMinutes} minutes</p><button class="delete-btn" onclick="deleteSession(${session.id})">Delete</button>`;container.appendChild(div);});}
document.getElementById("sessionForm").addEventListener("submit",async function(event){event.preventDefault();const session={topic:document.getElementById("sessionTopic").value,date:document.getElementById("sessionDate").value,durationMinutes:Number(document.getElementById("sessionDuration").value),studentId:Number(studentId)};const response=await fetch(`${API}/study-sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(session)});if(!response.ok){alert("Failed to create study session");return;}alert("Study session added successfully");document.getElementById("sessionForm").reset();await loadDashboard();});
async function deleteSession(id){if(!confirm("Delete this study session?"))return;const response=await fetch(`${API}/study-sessions/${id}`,{method:"DELETE"});if(!response.ok){alert("Failed to delete session");return;}await loadDashboard();}

loadDashboard();

// GLOBAL SEARCH
(function () {
    const searchInput = document.querySelector('.search-box input');
    const searchBox = document.querySelector('.search-box');
    if (!searchInput || !searchBox) return;

    searchBox.style.position = 'relative';

    const results = document.createElement('div');
    results.id = 'searchResults';
    Object.assign(results.style, {
        position: 'absolute', top: '48px', left: '0', right: '0',
        background: '#fff', border: '1px solid #e1e6f0', borderRadius: '12px',
        boxShadow: '0 14px 30px rgba(35,48,85,.14)', padding: '6px',
        display: 'none', zIndex: '100', maxHeight: '320px', overflowY: 'auto'
    });
    searchBox.appendChild(results);

    function escapeSearchHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value);
        return div.innerHTML;
    }

    function getSearchItems() {
        const items = [];
        document.querySelectorAll('.item').forEach((el) => {
            const text = el.innerText.trim();
            if (!text) return;
            const section = el.closest('.section');
            const title = section?.querySelector('.section-heading h2')?.innerText || 'StudySync';
            items.push({ element: el, title, text });
        });
        document.querySelectorAll('.section[id]').forEach((section) => {
            const heading = section.querySelector('.section-heading h2');
            if (heading) items.push({ element: section, title: heading.innerText, text: section.innerText });
        });
        const studentPanel = document.getElementById('student-panel');
        if (studentPanel) items.push({ element: studentPanel, title: 'Students', text: studentPanel.innerText });
        return items;
    }

    function hideResults() {
        results.style.display = 'none';
        results.innerHTML = '';
    }

    function showResults(matches, query) {
        results.innerHTML = '';
        if (!matches.length) {
            results.innerHTML = `<div style="padding:12px;color:#71809d;font-size:12px;text-align:center">No results for “${escapeSearchHtml(query)}”</div>`;
            results.style.display = 'block';
            return;
        }
        matches.slice(0, 8).forEach(({ element, title, text }) => {
            const button = document.createElement('button');
            const preview = text.replace(/\s+/g, ' ').slice(0, 80);
            button.type = 'button';
            button.style.cssText = 'display:block;width:100%;text-align:left;background:#fff;color:#24345f;border:0;border-radius:9px;padding:9px 10px;margin:2px 0;box-shadow:none;transform:none;cursor:pointer';
            button.innerHTML = `<strong style="display:block;font-size:11px">${escapeSearchHtml(title)}</strong><span style="display:block;color:#71809d;font-size:10px;margin-top:2px">${escapeSearchHtml(preview)}</span>`;
            button.addEventListener('mouseenter', () => button.style.background = '#f5f7ff');
            button.addEventListener('mouseleave', () => button.style.background = '#fff');
            button.addEventListener('click', () => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.transition = 'box-shadow .2s, border-color .2s';
                element.style.boxShadow = '0 0 0 3px rgba(91,80,232,.18)';
                element.style.borderColor = '#8b82f4';
                setTimeout(() => { element.style.boxShadow = ''; element.style.borderColor = ''; }, 1600);
                hideResults();
                searchInput.blur();
            });
            results.appendChild(button);
        });
        results.style.display = 'block';
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) { hideResults(); return; }
        const matches = getSearchItems().filter(({ text }) => text.toLowerCase().includes(query));
        showResults(matches, searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchInput.value = '';
            hideResults();
            searchInput.blur();
        }
    });

    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target)) hideResults();
    });
})();
