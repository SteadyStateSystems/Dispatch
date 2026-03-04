const technicianContainer = document.getElementById("technicianContainer");
window.M3T_API_BASE = window.M3T_API_BASE || "https://adjusted-bluejay-gratefully.ngrok-free.app";
const API_BASE = window.M3T_API_BASE;

const appState = {
  data: null,
  role: localStorage.getItem("m3t-role") || "tech",
  techFilter: localStorage.getItem("m3t-tech") || "",
  query: "",
  scheduleRange: localStorage.getItem("m3t-range") || "today",
  currentTech: localStorage.getItem("m3t-current-tech") || ""
};

const dispatchViewState = {
  tech: '',
  status: ''
};

function isAdminRole(role) {
  return role === "admin" || role === "system_admin";
}

function isSystemAdmin(role) {
  return role === "system_admin" || role === "admin";
}


function headerControls() {
  const wrap = document.createElement("div");
  wrap.className = "top-controls";
  wrap.innerHTML = `
    <label>Role
      <select id="roleMode">
        <option value="tech">Tech</option>
        <option value="project_manager">Project Manager</option>
        <option value="system_admin">System Admin</option>
      </select>
    </label>
    <label>My Jobs
      <select id="myTechFilter"><option value="">All techs</option></select>
    </label>
    <label>Range
      <select id="scheduleRange">
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="2weeks">Next 2 Weeks</option>
      </select>
    </label>
    <label>Search
      <input id="globalSearch" placeholder="Search tech/project/task/material" />
    </label>
    <button id="globalAddProjectBtn">+ Add Project</button>
    <button id="dispatchBoardBtn">Dispatch Board</button>
    <button id="adminTechBtn">Tech Admin</button>
    <button id="reloadBtn">Refresh</button>
  `;
  const controlsHost = document.getElementById('dashboardControls');
  if (controlsHost) {
    controlsHost.replaceChildren(wrap);
    const summary = document.createElement('div');
    summary.id = 'pmSummary';
    summary.style.color = '#fff';
    summary.style.marginBottom = '0.75rem';
    controlsHost.appendChild(summary);
  }

  const roleMode = document.getElementById("roleMode");
  roleMode.value = appState.role;
  roleMode.onchange = () => {
    appState.role = roleMode.value;
    localStorage.setItem("m3t-role", appState.role);
    const addBtn = document.getElementById("globalAddProjectBtn");
    const adminTechBtn = document.getElementById("adminTechBtn");
    if (addBtn) {
      addBtn.classList.toggle("disabled-btn", !isAdminRole(appState.role));
      addBtn.title = !isAdminRole(appState.role) ? "Admin only" : "";
    }
    if (adminTechBtn) {
      adminTechBtn.classList.toggle("disabled-btn", !isSystemAdmin(appState.role));
      adminTechBtn.title = !isSystemAdmin(appState.role) ? "System Admin only" : "";
    }
    render();
    loadPMSummary();
  };

  const myTech = document.getElementById("myTechFilter");
  myTech.value = appState.techFilter;

  const addBtn = document.getElementById("globalAddProjectBtn");
  const adminTechBtn = document.getElementById("adminTechBtn");
  if (addBtn) {
    addBtn.classList.toggle("disabled-btn", !isAdminRole(appState.role));
    addBtn.title = !isAdminRole(appState.role) ? "Admin only" : "";
  }
  if (adminTechBtn) {
    adminTechBtn.classList.toggle("disabled-btn", !isSystemAdmin(appState.role));
    adminTechBtn.title = !isSystemAdmin(appState.role) ? "System Admin only" : "";
  }
  myTech.onchange = () => {
    appState.techFilter = myTech.value;
    localStorage.setItem("m3t-tech", appState.techFilter);
    render();
    loadPMSummary();
  };

  const rangeSel = document.getElementById("scheduleRange");
  if (rangeSel) {
    rangeSel.value = appState.scheduleRange;
    rangeSel.onchange = () => {
      appState.scheduleRange = rangeSel.value;
      localStorage.setItem("m3t-range", appState.scheduleRange);
      render();
      loadPMSummary();
    };
  }

  const search = document.getElementById("globalSearch");
  search.oninput = () => {
    appState.query = (search.value || "").toLowerCase().trim();
    render();
  };

  const addProjectBtn = document.getElementById("globalAddProjectBtn");
  addProjectBtn.onclick = () => {
    if (!isAdminRole(appState.role)) {
      alert("Add Project is Admin only. Switch Role to Admin.");
      return;
    }
    const overlay = document.getElementById("addProjectOverlay");
    overlay.style.display = "block";
    const techSelect = overlay.querySelector('select[name="technician"]');
    if (techSelect && appState.techFilter && appState.techFilter !== 'all') techSelect.value = appState.techFilter;
  };

  async function dispatchAction(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-m3t-api-key': localStorage.getItem('m3t-api-key') || '',
        'x-m3t-role': appState.role || 'project_manager',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ ...body, role: appState.role, updatedBy: 'PM' })
    });
    const p = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(p.error || `HTTP ${res.status}`);
    return p;
  }

  async function renderDispatchBoard() {
    const res = await fetch(`${API_BASE}/dispatch-board`, { headers: { "ngrok-skip-browser-warning": "true" } });
    const p = await res.json();
    if (!res.ok) throw new Error('Dispatch load failed');
    const list = document.getElementById('dispatchBoardList');
    const techSel = document.getElementById('dispatchTechFilter');
    const statusSel = document.getElementById('dispatchStatusFilter');
    if (!list) return;

    const allItems = (p.items || []).slice(0, 300);
    if (techSel) {
      const current = techSel.value || dispatchViewState.tech || '';
      const techs = [...new Set(allItems.map(x => x.tech))].sort();
      techSel.innerHTML = '<option value="">All Techs</option>' + techs.map(t => `<option value="${t}">${t}</option>`).join('');
      techSel.value = current;
      dispatchViewState.tech = current;
    }

    if (statusSel) {
      dispatchViewState.status = statusSel.value || dispatchViewState.status || '';
    }

    const items = allItems.filter(it => {
      if (dispatchViewState.tech && it.tech !== dispatchViewState.tech) return false;
      if (dispatchViewState.status && (it.status || 'scheduled') !== dispatchViewState.status) return false;
      return true;
    });

    list.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.style.border = '1px solid #ddd';
      li.style.borderRadius = '8px';
      li.style.padding = '0.6rem';
      li.innerHTML = `
        <div><strong>${it.project}</strong> · ${it.tech} · ${it.status} · ${it.priority}</div>
        <div style="font-size:12px;color:#555;">${it.scheduledStart ? new Date(it.scheduledStart).toLocaleString() : 'Unscheduled'}</div>
        <div style="margin-top:0.4rem; display:flex; gap:0.4rem; flex-wrap:wrap;">
          <button data-action="top">Move to Top</button>
          <button data-action="earlier">-30m</button>
          <button data-action="later">+30m</button>
          <button data-action="eta30">ETA 30-60m</button>
          <button data-action="eta60">ETA 60-90m</button>
        </div>
      `;

      li.querySelector('[data-action="top"]').onclick = async () => {
        const all = allItems.filter(x => x.tech === it.tech).map(x => x.project);
        const ordered = [it.project, ...all.filter(n => n !== it.project)];
        await dispatchAction('/dispatch/order', { tech: it.tech, orderedProjects: ordered });
        await renderDispatchBoard();
      };
      li.querySelector('[data-action="earlier"]').onclick = async () => {
        await dispatchAction('/dispatch/reorder', { tech: it.tech, project: it.project, direction: 'earlier', minutes: 30 });
        await renderDispatchBoard();
      };
      li.querySelector('[data-action="later"]').onclick = async () => {
        await dispatchAction('/dispatch/reorder', { tech: it.tech, project: it.project, direction: 'later', minutes: 30 });
        await renderDispatchBoard();
      };
      const sendEtaPreset = async (startMin, endMin) => {
        const now = Date.now();
        const start = new Date(now + startMin * 60 * 1000).toISOString();
        const end = new Date(now + endMin * 60 * 1000).toISOString();
        const msg = `ETA update: expected between ${new Date(start).toLocaleTimeString()} and ${new Date(end).toLocaleTimeString()}.`;
        await dispatchAction('/dispatch/eta-notify', { tech: it.tech, project: it.project, etaWindowStart: start, etaWindowEnd: end, message: msg });
        alert(`ETA update saved/logged (${startMin}-${endMin} minute window).`);
        await renderDispatchBoard();
      };

      li.querySelector('[data-action="eta30"]').onclick = async () => sendEtaPreset(30, 60);
      li.querySelector('[data-action="eta60"]').onclick = async () => sendEtaPreset(60, 90);

      list.appendChild(li);
    });
  }

  const dispatchBtn = document.getElementById('dispatchBoardBtn');
  if (dispatchBtn) {
    dispatchBtn.onclick = async () => {
      try {
        await renderDispatchBoard();
        const ov = document.getElementById('dispatchOverlay');
        if (ov) ov.style.display = 'block';
      } catch (e) {
        alert(`Dispatch board failed: ${e.message}`);
      }
    };
  }

  const dispatchTechFilter = document.getElementById('dispatchTechFilter');
  if (dispatchTechFilter) {
    dispatchTechFilter.onchange = async () => {
      dispatchViewState.tech = dispatchTechFilter.value || '';
      try { await renderDispatchBoard(); } catch (e) { alert(`Filter failed: ${e.message}`); }
    };
  }

  const dispatchStatusFilter = document.getElementById('dispatchStatusFilter');
  if (dispatchStatusFilter) {
    dispatchStatusFilter.onchange = async () => {
      dispatchViewState.status = dispatchStatusFilter.value || '';
      try { await renderDispatchBoard(); } catch (e) { alert(`Filter failed: ${e.message}`); }
    };
  }

  const dispatchRefreshBtn = document.getElementById('dispatchRefreshBtn');
  if (dispatchRefreshBtn) {
    dispatchRefreshBtn.onclick = async () => {
      try { await renderDispatchBoard(); } catch (e) { alert(`Refresh failed: ${e.message}`); }
    };
  }

  const dispatchRunRecurrenceBtn = document.getElementById('dispatchRunRecurrenceBtn');
  if (dispatchRunRecurrenceBtn) {
    dispatchRunRecurrenceBtn.onclick = async () => {
      try {
        const out = await dispatchAction('/dispatch/run-recurrence', {});
        alert(`Recurring scheduler complete. Created: ${(out.created || []).length}`);
        await renderDispatchBoard();
      } catch (e) {
        alert(`Recurring scheduler failed: ${e.message}`);
      }
    };
  }

  const adminTechBtn2 = document.getElementById("adminTechBtn");
  if (adminTechBtn2) {
    adminTechBtn2.onclick = () => {
      if (!isSystemAdmin(appState.role)) {
        alert('Tech admin is System Admin only.');
        return;
      }
      const overlay = document.getElementById('adminTechOverlay');
      if (overlay) overlay.style.display = 'block';
    };
  }

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
  if (!appState.currentTech) {
    appState.currentTech = Object.keys(appState.data.technicians)[0] || "";
    localStorage.setItem("m3t-current-tech", appState.currentTech);
  }

  if (!appState.techFilter) {
    appState.techFilter = appState.currentTech;
    localStorage.setItem("m3t-tech", appState.techFilter);
  }

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

function inSelectedRange(project) {
  if (!project.scheduledStart) return true;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (appState.scheduleRange === 'today') end.setDate(end.getDate() + 1);
  else if (appState.scheduleRange === 'week') end.setDate(end.getDate() + 7);
  else end.setDate(end.getDate() + 14);
  const sched = new Date(project.scheduledStart);
  return sched >= start && sched < end;
}

function projectMatches(techName, projectName, project) {
  if (appState.techFilter && appState.techFilter !== 'all' && appState.techFilter !== techName) return false;
  if (!inSelectedRange(project)) return false;
  if (!appState.query) return true;
  const q = appState.query;
  const blob = [
    techName,
    projectName,
    project.scope || "",
    project.location || "",
    project.status || "",
    ...(project.tasks || []).map(t => t.name),
    ...(project.materials || []).map(m => m.name)
  ].join(" ").toLowerCase();
  return blob.includes(q);
}

async function loadPMSummary() {
  const box = document.getElementById('pmSummary');
  if (!box) return;
  if (!(appState.role === 'admin' || appState.role === 'project_manager')) {
    box.textContent = '';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/pm-summary`, { headers: { "ngrok-skip-browser-warning": "true" } });
    const p = await res.json();
    if (!res.ok) throw new Error('summary failed');
    const hours = p.hoursByTech || {};
    const hourText = Object.entries(hours).slice(0, 3).map(([k,v]) => `${k}:${v}h`).join(' · ');
    box.textContent = `PM Summary — Total: ${p.totalProjects || 0} · Overdue: ${p.overdue || 0} · At Risk (48h): ${p.atRisk || 0}${hourText ? ` · Hours: ${hourText}` : ''}`;
  } catch {
    box.textContent = 'PM Summary unavailable';
  }
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
        ${completion}% Complete · ${project.status || 'scheduled'}
        <div class="progress-bar"><div class="progress-fill" style="width:${completion}%"></div></div>
        <small>${project.scheduledStart ? `Scheduled: ${new Date(project.scheduledStart).toLocaleString()}` : 'Scheduled: n/a'}</small><br/>
        <small>Updated: ${project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : "n/a"}</small>
      `;

      entry.addEventListener("click", () => {
        const url = `project.html?tech=${encodeURIComponent(techName)}&project=${encodeURIComponent(projectName)}&role=${encodeURIComponent(appState.role)}`;
        window.location.href = url;
      });

      projectList.appendChild(entry);
    });

    techHeader.addEventListener("click", () => {
      const expanded = projectList.style.display === "none";
      projectList.style.display = expanded ? "block" : "none";
      techCard.classList.toggle("expanded", expanded);
    });

    techCard.appendChild(projectList);
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
    loadPMSummary();
  } catch (err) {
    console.error(err);
    appState.data = null;
    render();
  }
}

headerControls();
loadData();

