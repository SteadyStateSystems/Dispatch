const technicianContainer = document.getElementById("technicianContainer");
const API_BASE = "https://adjusted-bluejay-gratefully.ngrok-free.app";

const appState = {
  data: null,
  role: localStorage.getItem("m3t-role") || "tech",
  techFilter: localStorage.getItem("m3t-tech") || "",
  query: ""
};

function headerControls() {
  const wrap = document.createElement("div");
  wrap.className = "top-controls";
  wrap.innerHTML = `
    <label>Role
      <select id="roleMode">
        <option value="tech">Tech</option>
        <option value="admin">Admin</option>
      </select>
    </label>
    <label>My Jobs
      <select id="myTechFilter"><option value="">All techs</option></select>
    </label>
    <label>Search
      <input id="globalSearch" placeholder="Search tech/project/task/material" />
    </label>
    <button id="reloadBtn">Refresh</button>
  `;
  technicianContainer.before(wrap);

  const roleMode = document.getElementById("roleMode");
  roleMode.value = appState.role;
  roleMode.onchange = () => {
    appState.role = roleMode.value;
    localStorage.setItem("m3t-role", appState.role);
    render();
  };

  const myTech = document.getElementById("myTechFilter");
  myTech.value = appState.techFilter;
  myTech.onchange = () => {
    appState.techFilter = myTech.value;
    localStorage.setItem("m3t-tech", appState.techFilter);
    render();
  };

  const search = document.getElementById("globalSearch");
  search.oninput = () => {
    appState.query = (search.value || "").toLowerCase().trim();
    render();
  };

  document.getElementById("reloadBtn").onclick = loadData;
}

function populateTechFilter() {
  const myTech = document.getElementById("myTechFilter");
  if (!myTech || !appState.data?.technicians) return;
  const current = myTech.value;
  myTech.innerHTML = '<option value="">All techs</option>';
  Object.keys(appState.data.technicians).forEach((tech) => {
    const opt = document.createElement("option");
    opt.value = tech;
    opt.textContent = tech;
    myTech.appendChild(opt);
  });
  myTech.value = current || appState.techFilter || "";
}

function projectProgress(project) {
  const tasks = (project.tasks || []).filter(t => !t.deletedAt);
  const materials = (project.materials || []).filter(m => !m.deletedAt);

  const materialWeight = (stage) => {
    const s = Number(stage ?? 0);
    if (s === 1) return 0.25;
    if (s === 2) return 0.5;
    if (s === 3 || s === 4) return 1;
    return 0;
  };

  const total = tasks.reduce((sum, t) => sum + ((t.subtasks || []).filter(st => !st.deletedAt).length || 1), 0) + materials.length;
  const done = tasks.reduce((sum, t) => {
    const subs = (t.subtasks || []).filter(st => !st.deletedAt);
    if (subs.length) return sum + subs.filter(st => st.status === 1).length;
    return sum + (t.complete ? 1 : 0);
  }, 0) + materials.reduce((sum, m) => sum + materialWeight(m.stage), 0);

  return total ? Math.round((done / total) * 100) : 0;
}

function projectMatches(techName, projectName, project) {
  if (appState.techFilter && appState.techFilter !== techName) return false;
  if (!appState.query) return true;
  const q = appState.query;
  const blob = [
    techName,
    projectName,
    project.scope || "",
    ...(project.tasks || []).map(t => t.name),
    ...(project.materials || []).map(m => m.name)
  ].join(" ").toLowerCase();
  return blob.includes(q);
}

function render() {
  technicianContainer.innerHTML = "";
  const data = appState.data;
  if (!data?.technicians) {
    technicianContainer.innerHTML = `<p style="color:red">Failed to load project data.</p>`;
    return;
  }

  Object.entries(data.technicians).forEach(([techName, techData]) => {
    const projects = Object.entries(techData.projects || {})
      .filter(([, p]) => !p.deletedAt)
      .filter(([projectName, p]) => projectMatches(techName, projectName, p));

    if (!projects.length) return;

    const techCard = document.createElement("div");
    techCard.className = "tech-section";

    const techHeader = document.createElement("div");
    techHeader.className = "tech-header";
    techHeader.textContent = techName;
    techCard.appendChild(techHeader);

    const projectList = document.createElement("div");
    projectList.className = "project-list";
    projectList.style.display = "none";

    projects.forEach(([projectName, project]) => {
      const completion = projectProgress(project);
      const entry = document.createElement("div");
      entry.className = "project-entry";
      entry.innerHTML = `
        <strong>${projectName}</strong><br/>
        ${completion}% Complete
        <div class="progress-bar"><div class="progress-fill" style="width:${completion}%"></div></div>
        <small>Updated: ${project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : "n/a"}</small>
      `;

      entry.addEventListener("click", () => {
        const url = `project.html?tech=${encodeURIComponent(techName)}&project=${encodeURIComponent(projectName)}&role=${encodeURIComponent(appState.role)}`;
        window.location.href = url;
      });

      projectList.appendChild(entry);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Project";
    addBtn.className = "add-task-btn add-project-btn";
    addBtn.style.display = "none";
    addBtn.disabled = appState.role !== "admin";
    addBtn.title = appState.role !== "admin" ? "Admin only" : "";
    addBtn.onclick = () => {
      const overlay = document.getElementById("addProjectOverlay");
      overlay.style.display = "block";
      overlay.querySelector('select[name="technician"]').value = techName;
    };

    techHeader.addEventListener("click", () => {
      const expanded = projectList.style.display === "none";
      projectList.style.display = expanded ? "block" : "none";
      addBtn.style.display = expanded ? "inline-block" : "none";
      techCard.classList.toggle("expanded", expanded);
    });

    techCard.appendChild(projectList);
    techCard.appendChild(addBtn);
    technicianContainer.appendChild(techCard);
  });

  if (!technicianContainer.children.length) {
    technicianContainer.innerHTML = `<p style="color:#fff">No matching projects.</p>`;
  }
}

async function loadData() {
  try {
    const res = await fetch(`${API_BASE}/data`, { headers: { "ngrok-skip-browser-warning": "true" } });
    if (!res.ok) throw new Error("Server error");
    appState.data = await res.json();
    populateTechFilter();
    render();
  } catch (err) {
    console.error(err);
    appState.data = null;
    render();
  }
}

headerControls();
loadData();
