const API = "/api";

let studentId = 1;
let editingTaskId = null;
let editingTaskCompleted = false;
let editingSubjectId = null;
let editingStudentId = null;

const $ = (id) => document.getElementById(id);
const esc = (value) => { const d = document.createElement("div"); d.textContent = value ?? ""; return d.innerHTML; };

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try { const body = await response.json(); message = body.message || message; } catch (_) {}
        throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
}

async function loadDashboard(showAlert = true) {
    const input = $("studentId");
    if (!input || !input.value) return;
    studentId = Number(input.value);
    try {
        const data = await request(`${API}/dashboard/${studentId}`);
        $("welcome").textContent = `Welcome back, ${data.studentName}`;
        $("totalSubjects").textContent = data.totalSubjects;
        $("totalTasks").textContent = data.totalTasks;
        $("completedTasks").textContent = `${data.completedTasks} / ${data.totalTasks}`;
        $("pendingTasks").textContent = data.pendingTasks;
        $("totalSessions").textContent = data.totalStudySessions;
        $("studyMinutes").textContent = data.totalStudyMinutes;
        setText("totalStudents", await getStudentCount());
        setText("completedTasksMini", data.completedTasks);
        setText("pendingTasksMini", data.pendingTasks);
        setText("studyMinutesMini", data.totalStudyMinutes);
        setText("subjectsMini", data.totalSubjects);
        const completion = data.totalTasks ? Math.round(data.completedTasks / data.totalTasks * 100) : 0;
        setText("progressPercent", `${completion}%`);
        setProgress("taskProgressBar", completion);
        setProgress("pendingProgressBar", data.totalTasks ? Math.round(data.pendingTasks / data.totalTasks * 100) : 0);
        setProgress("studyProgressBar", Math.min(100, Math.round(data.totalStudyMinutes / 600 * 100)));
        const ring = document.querySelector(".progress-ring");
        if (ring) ring.style.background = `conic-gradient(#38b99b ${completion * 3.6}deg, #e4eaf4 ${completion * 3.6}deg)`;
        await Promise.all([loadSubjects(), loadTasks(), loadSessions(), loadStudents()]);
        updateAccountHeader();
    } catch (error) {
        if (showAlert) alert(`Could not load StudySync: ${error.message}`);
        console.error(error);
    }
}

function setText(id, value) { if ($(id)) $(id).textContent = value; }
function setProgress(id, value) { if ($(id)) $(id).style.width = `${Math.max(0, Math.min(100, value))}%`; }
async function getStudentCount() { try { return (await request(`${API}/students`)).length; } catch (_) { return "—"; } }

// ---------------- STUDENT / ACCOUNT MANAGEMENT ----------------
function createStudentManagementUI() {
    const panel = $("student-panel");
    if (!panel || $("studentManagement")) return;
    const wrapper = document.createElement("div");
    wrapper.id = "studentManagement";
    wrapper.innerHTML = `
      <div class="account-manager">
        <div class="account-manager-heading"><div><h2>Student Accounts</h2><p>Create and manage students in this StudySync workspace.</p></div><button type="button" id="refreshStudentsBtn">Refresh</button></div>
        <form id="studentForm" class="student-form">
          <input id="newStudentName" type="text" placeholder="Full name" required>
          <input id="newStudentEmail" type="email" placeholder="Email address" required>
          <input id="newStudentCourse" type="text" placeholder="Course" required>
          <button type="submit">+ Add New Student</button>
        </form>
        <div id="studentEditBox" style="display:none">
          <h3>Edit Student</h3>
          <form id="editStudentForm" class="student-form">
            <input id="editStudentName" type="text" required>
            <input id="editStudentEmail" type="email" required>
            <input id="editStudentCourse" type="text" required>
            <button type="submit">Save Changes</button><button type="button" id="cancelStudentEdit">Cancel</button>
          </form>
        </div>
        <div id="studentList" class="student-list">Loading students...</div>
      </div>`;
    panel.appendChild(wrapper);
    $("studentForm").addEventListener("submit", addStudent);
    $("editStudentForm").addEventListener("submit", updateStudent);
    $("cancelStudentEdit").addEventListener("click", cancelStudentEdit);
    $("refreshStudentsBtn").addEventListener("click", loadStudents);
}

async function loadStudents() {
    const container = $("studentList");
    if (!container) return;
    try {
        const students = await request(`${API}/students`);
        container.innerHTML = "";
        if (!students.length) { container.innerHTML = '<p class="empty-state">No students yet. Add the first student above.</p>'; return; }
        students.forEach(s => {
            const card = document.createElement("div"); card.className = "student-account-card";
            card.innerHTML = `<div class="student-account-avatar">${esc((s.name || "S").charAt(0).toUpperCase())}</div><div class="student-account-info"><strong>${esc(s.name)}</strong><span>${esc(s.email)}</span><small>${esc(s.course)} · ID ${s.id}</small></div><div class="student-account-actions"><button type="button" data-edit="${s.id}">Edit</button><button type="button" class="delete-btn" data-delete="${s.id}">Delete</button><button type="button" data-open="${s.id}">Open</button></div>`;
            card.querySelector(`[data-edit="${s.id}"]`).onclick = () => startStudentEdit(s);
            card.querySelector(`[data-delete="${s.id}"]`).onclick = () => deleteStudent(s.id, s.name);
            card.querySelector(`[data-open="${s.id}"]`).onclick = () => switchStudent(s.id);
            container.appendChild(card);
        });
    } catch (error) { container.innerHTML = `<p class="empty-state">Unable to load students: ${esc(error.message)}</p>`; }
}

async function addStudent(event) {
    event.preventDefault();
    try {
        const student = await request(`${API}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: $("newStudentName").value.trim(), email: $("newStudentEmail").value.trim(), course: $("newStudentCourse").value.trim() }) });
        event.target.reset();
        await loadStudents();
        setStudent(student.id);
        alert(`Student ${student.name} created successfully.`);
    } catch (error) { alert(`Could not create student: ${error.message}`); }
}

function startStudentEdit(student) {
    editingStudentId = student.id;
    $("editStudentName").value = student.name || "";
    $("editStudentEmail").value = student.email || "";
    $("editStudentCourse").value = student.course || "";
    $("studentEditBox").style.display = "block";
    $("studentEditBox").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function updateStudent(event) {
    event.preventDefault();
    if (!editingStudentId) return;
    try {
        await request(`${API}/students/${editingStudentId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: $("editStudentName").value.trim(), email: $("editStudentEmail").value.trim(), course: $("editStudentCourse").value.trim() }) });
        alert("Student updated successfully."); cancelStudentEdit(); await loadStudents();
        if (editingStudentId === studentId) await loadDashboard(false);
    } catch (error) { alert(`Could not update student: ${error.message}`); }
}

function cancelStudentEdit() { editingStudentId = null; $("studentEditBox").style.display = "none"; $("editStudentForm").reset(); }

async function deleteStudent(id, name) {
    if (!confirm(`Delete student ${name}? This is permanent.`)) return;
    try { await request(`${API}/students/${id}`, { method: "DELETE" }); if (Number(id) === Number(studentId)) { const students = await request(`${API}/students`); if (students.length) setStudent(students[0].id); } await loadStudents(); await loadDashboard(false); }
    catch (error) { alert(`Could not delete student: ${error.message}`); }
}

function setStudent(id) { studentId = Number(id); $("studentId").value = studentId; closeAccountMenu(); loadDashboard(false); }
function switchStudent(id) { setStudent(id); document.getElementById("student-panel")?.scrollIntoView({ behavior: "smooth" }); }

function setupAccountMenu() {
    const user = document.querySelector(".topbar-user");
    if (!user || $("accountMenu")) return;
    user.style.cursor = "pointer";
    const menu = document.createElement("div"); menu.id = "accountMenu";
    menu.style.cssText = "display:none;position:absolute;right:24px;top:70px;background:#fff;border:1px solid #e5e9f2;border-radius:14px;box-shadow:0 18px 45px rgba(30,40,80,.18);padding:8px;z-index:999;min-width:190px";
    menu.innerHTML = `<button type="button" data-account="manage">Account & Students</button><button type="button" data-account="switch">Switch Student</button><button type="button" data-account="refresh">Refresh Dashboard</button>`;
    document.body.appendChild(menu);
    user.onclick = (event) => { event.stopPropagation(); menu.style.display = menu.style.display === "none" ? "block" : "none"; };
    menu.querySelector('[data-account="manage"]').onclick = () => { closeAccountMenu(); $("student-panel").scrollIntoView({ behavior: "smooth" }); };
    menu.querySelector('[data-account="switch"]').onclick = () => { closeAccountMenu(); loadStudents(); $("student-panel").scrollIntoView({ behavior: "smooth" }); };
    menu.querySelector('[data-account="refresh"]').onclick = () => { closeAccountMenu(); loadDashboard(); };
    document.addEventListener("click", (event) => { if (!menu.contains(event.target) && !user.contains(event.target)) closeAccountMenu(); });
}
function closeAccountMenu() { if ($("accountMenu")) $("accountMenu").style.display = "none"; }
async function updateAccountHeader() { try { const students = await request(`${API}/students`); const current = students.find(s => Number(s.id) === Number(studentId)); if (current) { const strong = document.querySelector(".topbar-user .user-copy strong"); const avatar = document.querySelector(".topbar-user .avatar"); if (strong) strong.textContent = current.name; if (avatar) avatar.textContent = current.name.charAt(0).toUpperCase(); } } catch (_) {} }

// ---------------- SUBJECTS ----------------
async function loadSubjects() {
    const container = $("subjectsList"); if (!container) return;
    try {
        const subjects = await request(`${API}/subjects/student/${studentId}`); container.innerHTML = "";
        if (!subjects.length) { container.innerHTML = "<p>No subjects found. Add your first subject above.</p>"; return; }
        subjects.forEach(s => { const div = document.createElement("div"); div.className = "item"; div.innerHTML = `<h3>${esc(s.name)}</h3><p>${esc(s.description || "No description")}</p><button type="button" data-edit="${s.id}">Edit</button><button type="button" class="delete-btn" data-delete="${s.id}">Delete</button>`; div.querySelector("[data-edit]").onclick = () => startEditSubject(s); div.querySelector("[data-delete]").onclick = () => deleteSubject(s.id); container.appendChild(div); });
    } catch (error) { container.innerHTML = `<p>Failed to load subjects: ${esc(error.message)}</p>`; }
}
function startEditSubject(s) { editingSubjectId=s.id; $("editSubjectName").value=s.name||""; $("editSubjectDescription").value=s.description||""; $("editSubjectSection").style.display="block"; $("editSubjectSection").scrollIntoView({behavior:"smooth"}); }
function cancelSubjectEdit(){ editingSubjectId=null; $("editSubjectForm").reset(); $("editSubjectSection").style.display="none"; }
async function deleteSubject(id){ if(!confirm("Delete this subject?"))return; try{await request(`${API}/subjects/${id}`,{method:"DELETE"});await loadDashboard(false);}catch(e){alert(`Could not delete subject: ${e.message}`);} }

// ---------------- TASKS ----------------
async function loadTasks(){
    const container=$("tasksList"); if(!container)return;
    try{const tasks=await request(`${API}/tasks/student/${studentId}`);container.innerHTML="";if(!tasks.length){container.innerHTML="<p>No tasks found.</p>";return;}tasks.forEach(t=>{const d=document.createElement("div");d.className="item";d.innerHTML=`<h3 class="${t.completed?"completed":""}">${esc(t.title)}</h3><p>${esc(t.description||"No description")}</p><p><strong>Due:</strong> ${esc(t.dueDate)}</p><p><strong>Priority:</strong> ${esc(t.priority)}</p><p><strong>Status:</strong> ${t.completed?"Completed":"Pending"}</p><button type="button" data-edit="${t.id}">Edit</button>${t.completed?"":`<button type="button" data-complete="${t.id}">Mark Complete</button>`}<button type="button" class="delete-btn" data-delete="${t.id}">Delete</button>`;d.querySelector("[data-edit]").onclick=()=>startEditTask(t);const complete=d.querySelector("[data-complete]");if(complete)complete.onclick=()=>completeTask(t);d.querySelector("[data-delete]").onclick=()=>deleteTask(t.id);container.appendChild(d);});}catch(e){container.innerHTML=`<p>Failed to load tasks: ${esc(e.message)}</p>`;}
}
function startEditTask(t){editingTaskId=t.id;editingTaskCompleted=t.completed;$("editTaskTitle").value=t.title||"";$("editTaskDescription").value=t.description||"";$("editTaskDueDate").value=t.dueDate||"";$("editTaskPriority").value=t.priority||"";$("editTaskSection").style.display="block";$("editTaskSection").scrollIntoView({behavior:"smooth"});}
function cancelEdit(){editingTaskId=null;editingTaskCompleted=false;$("editTaskForm").reset();$("editTaskSection").style.display="none";}
async function completeTask(t){try{await saveTask(t.id,t.title,t.description,t.dueDate,t.priority,true);await loadDashboard(false);}catch(e){alert(`Could not complete task: ${e.message}`);}}
async function deleteTask(id){if(!confirm("Delete this task?"))return;try{await request(`${API}/tasks/${id}`,{method:"DELETE"});await loadDashboard(false);}catch(e){alert(`Could not delete task: ${e.message}`);}}
async function saveTask(id,title,description,dueDate,priority,completed){return request(`${API}/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,description,dueDate,priority,completed,studentId:Number(studentId)})});}

// ---------------- STUDY SESSIONS ----------------
async function loadSessions(){const c=$("sessionsList");if(!c)return;try{const sessions=await request(`${API}/study-sessions/student/${studentId}`);c.innerHTML="";if(!sessions.length){c.innerHTML="<p>No study sessions found.</p>";return;}sessions.forEach(s=>{const d=document.createElement("div");d.className="item";d.innerHTML=`<h3>${esc(s.topic)}</h3><p><strong>Date:</strong> ${esc(s.date)}</p><p><strong>Duration:</strong> ${esc(s.durationMinutes)} minutes</p><button type="button" class="delete-btn">Delete</button>`;d.querySelector("button").onclick=()=>deleteSession(s.id);c.appendChild(d);});}catch(e){c.innerHTML=`<p>Failed to load sessions: ${esc(e.message)}</p>`;}}
async function deleteSession(id){if(!confirm("Delete this study session?"))return;try{await request(`${API}/study-sessions/${id}`,{method:"DELETE"});await loadDashboard(false);}catch(e){alert(`Could not delete session: ${e.message}`);}}

// ---------------- FORMS ----------------
function setupForms(){
    $("subjectForm")?.addEventListener("submit",async e=>{e.preventDefault();try{await request(`${API}/subjects`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("subjectName").value.trim(),description:$("subjectDescription").value.trim(),studentId:Number(studentId)})});e.target.reset();await loadDashboard(false);alert("Subject added successfully.");}catch(x){alert(`Could not add subject: ${x.message}`);}});
    $("editSubjectForm")?.addEventListener("submit",async e=>{e.preventDefault();try{await request(`${API}/subjects/${editingSubjectId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("editSubjectName").value.trim(),description:$("editSubjectDescription").value.trim(),studentId:Number(studentId)})});cancelSubjectEdit();await loadDashboard(false);alert("Subject updated successfully.");}catch(x){alert(`Could not update subject: ${x.message}`);}});
    $("taskForm")?.addEventListener("submit",async e=>{e.preventDefault();try{await request(`${API}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:$("taskTitle").value.trim(),description:$("taskDescription").value.trim(),dueDate:$("taskDueDate").value,priority:$("taskPriority").value,completed:false,studentId:Number(studentId)})});e.target.reset();await loadDashboard(false);alert("Task added successfully.");}catch(x){alert(`Could not add task: ${x.message}`);}});
    $("editTaskForm")?.addEventListener("submit",async e=>{e.preventDefault();try{await saveTask(editingTaskId,$("editTaskTitle").value.trim(),$("editTaskDescription").value.trim(),$("editTaskDueDate").value,$("editTaskPriority").value,editingTaskCompleted);cancelEdit();await loadDashboard(false);alert("Task updated successfully.");}catch(x){alert(`Could not update task: ${x.message}`);}});
    $("sessionForm")?.addEventListener("submit",async e=>{e.preventDefault();try{await request(`${API}/study-sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:$("sessionTopic").value.trim(),date:$("sessionDate").value,durationMinutes:Number($("sessionDuration").value),studentId:Number(studentId)})});e.target.reset();await loadDashboard(false);alert("Study session added successfully.");}catch(x){alert(`Could not add study session: ${x.message}`);}});
}

// ---------------- SEARCH ----------------
function setupSearch(){
    const input=document.querySelector(".search-box input"),box=document.querySelector(".search-box");if(!input||!box)return;box.style.position="relative";
    const results=document.createElement("div");results.id="searchResults";results.style.cssText="position:absolute;top:48px;left:0;right:0;background:#fff;border:1px solid #e1e6f0;border-radius:12px;box-shadow:0 14px 30px rgba(35,48,85,.14);padding:6px;display:none;z-index:100;max-height:320px;overflow:auto";box.appendChild(results);
    const hide=()=>{results.style.display="none";results.innerHTML=""};
    input.addEventListener("input",()=>{const q=input.value.trim().toLowerCase();if(!q){hide();return;}const matches=[...document.querySelectorAll(".item")].filter(e=>e.innerText.toLowerCase().includes(q));results.innerHTML="";if(!matches.length){results.innerHTML=`<div style="padding:12px;text-align:center;color:#71809d">No results for “${esc(input.value.trim())}”</div>`;}else matches.slice(0,8).forEach(el=>{const b=document.createElement("button");b.type="button";b.style.cssText="display:block;width:100%;text-align:left;background:#fff;color:#24345f;border:0;border-radius:9px;padding:9px 10px;margin:2px 0;cursor:pointer";b.textContent=el.innerText.replace(/\s+/g," ").slice(0,100);b.onclick=()=>{el.scrollIntoView({behavior:"smooth",block:"center"});hide();input.blur();};results.appendChild(b);});results.style.display="block";});
    input.addEventListener("keydown",e=>{if(e.key==="Escape"){input.value="";hide();input.blur();}});document.addEventListener("click",e=>{if(!box.contains(e.target))hide();});
}

// Small resilience improvements: do not leave the whole page blank if one API call fails.
window.addEventListener("unhandledrejection", e => console.error("StudySync request error:", e.reason));
window.addEventListener("error", e => console.error("StudySync frontend error:", e.error || e.message));

createStudentManagementUI();
setupAccountMenu();
setupForms();
setupSearch();
loadDashboard(false);
