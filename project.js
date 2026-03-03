const API_BASE = "https://adjusted-bluejay-gratefully.ngrok-free.app";

const queueKey = "m3t-offline-queue";
const params = new URLSearchParams(window.location.search);
const ctx = {
  tech: params.get("tech"),
  project: params.get("project"),
  role: (params.get("role") || localStorage.getItem("m3t-role") || "tech").toLowerCase()
};

localStorage.setItem("m3t-role", ctx.role);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("project-name").textContent = ctx.project || "Project";
  installExtras();
  loadProjectData(ctx.tech, ctx.project);
  flushQueue();
  window.addEventListener("online", flushQueue);
});

function installExtras() {
  const container = document.getElementById("project-container");

  const roleBar = document.createElement("div");
  roleBar.className = "role-bar";
  roleBar.innerHTML = `
    <strong>Role:</strong>
    <select id="roleModeProject">
      <option value="tech">Tech</option>
      <option value="admin">Admin</option>
    </select>
    <button id="undoBtn">Undo</button>
    <span id="offlineBadge"></span>
  `;
  container.prepend(roleBar);

  const roleSelect = document.getElementById("roleModeProject");
  roleSelect.value = ctx.role;
  roleSelect.onchange = () => {
    ctx.role = roleSelect.value;
    localStorage.setItem("m3t-role", ctx.role);
    loadProjectData(ctx.tech, ctx.project);
  };

  document.getElementById("undoBtn").onclick = async () => {
    if (ctx.role !== "admin") return alert("Admin role required.");
    await apiPost("/undo", { updatedBy: "Admin", role: ctx.role }, true);
    loadProjectData(ctx.tech, ctx.project);
  };

  const timeBox = document.createElement("div");
  timeBox.className = "collapsible-section";
  timeBox.innerHTML = `
    <div class="collapsible-header" onclick="toggleSection('time-section')">Time Tracking</div>
    <div class="collapsible-content" id="time-section">
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        <button class="add-task-btn" data-time="travel_to_start">Start Travel To</button>
        <button class="add-task-btn" data-time="onsite_start">Start On Site</button>
        <button class="add-task-btn" data-time="travel_from_start">Start Travel From</button>
        <button class="add-task-btn" data-time="travel_from_end">End Travel From</button>
      </div>
      <small id="time-summary" style="display:block;margin-top:0.5rem;color:#333;"></small>
    </div>
  `;
  container.appendChild(timeBox);

  timeBox.querySelectorAll('button[data-time]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-time');
      await apiPost('/time-events', { tech: ctx.tech, project: ctx.project, type, user: ctx.tech, source: 'web', role: ctx.role }, true);
      loadProjectData(ctx.tech, ctx.project);
    });
  });

  const timeline = document.createElement("div");
  timeline.className = "collapsible-section";
  timeline.innerHTML = `
    <div class="collapsible-header" onclick="toggleSection('timeline-section')">Audit Timeline</div>
    <div class="collapsible-content" id="timeline-section"><ul id="timeline-list"></ul></div>
  `;
  container.appendChild(timeline);

  const attach = document.createElement("div");
  attach.className = "collapsible-section";
  attach.innerHTML = `
    <div class="collapsible-header" onclick="toggleSection('attachments-section')">Photo Attachments</div>
    <div class="collapsible-content" id="attachments-section">
      <input id="attachTarget" placeholder="target e.g. task:Install Router" />
      <input id="attachUrl" placeholder="image URL" />
      <input id="attachNote" placeholder="note (optional)" />
      <button class="add-task-btn" id="attachBtn">Add Attachment</button>
      <ul id="attachments-list"></ul>
    </div>
  `;
  container.appendChild(attach);

  document.getElementById("attachBtn").onclick = async () => {
    const target = document.getElementById("attachTarget").value.trim();
    const url = document.getElementById("attachUrl").value.trim();
    const note = document.getElementById("attachNote").value.trim();
    if (!target || !url) return alert("Target and URL are required.");
    await apiPost("/attachments", { tech: ctx.tech, project: ctx.project, type: "photo", target, url, note, uploadedBy: "Technician", role: ctx.role }, true);
    document.getElementById("attachUrl").value = "";
    document.getElementById("attachNote").value = "";
    loadProjectData(ctx.tech, ctx.project);
  };

  updateOfflineBadge();
}

function queueAction(item) {
  const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
  q.push(item);
  localStorage.setItem(queueKey, JSON.stringify(q));
  updateOfflineBadge();
}

function updateOfflineBadge() {
  const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
  const badge = document.getElementById("offlineBadge");
  if (!badge) return;
  badge.textContent = q.length ? `Queued: ${q.length}` : (navigator.onLine ? "Online" : "Offline");
}

async function flushQueue() {
  if (!navigator.onLine) return;
  const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
  if (!q.length) return updateOfflineBadge();

  const remaining = [];
  for (const item of q) {
    try {
      await apiPost(item.path, item.body, false, true);
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(queueKey, JSON.stringify(remaining));
  updateOfflineBadge();
}

async function apiPost(path, body, allowQueue = true, silent = false) {
  if (!navigator.onLine) {
    if (allowQueue) {
      queueAction({ path, body });
      if (!silent) alert("Offline: action queued.");
      return { queued: true };
    }
    throw new Error("Offline");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      "x-m3t-role": ctx.role
    },
    body: JSON.stringify(body)
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) throw new Error(payload.error || "Request failed");
  return payload;
}

function setAdminOnlyButtons() {
  const adminOnly = document.querySelectorAll(".admin-only");
  adminOnly.forEach((el) => {
    el.disabled = ctx.role !== "admin";
    el.title = ctx.role !== "admin" ? "Admin only" : "";
  });
}

function renderTimeline(entries = []) {
  const ul = document.getElementById("timeline-list");
  if (!ul) return;
  ul.innerHTML = "";
  entries.slice(0, 50).forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(e.timestamp).toLocaleString()} — ${e.action} (${e.updatedBy || e.technician || e.tech || "system"})`;
    ul.appendChild(li);
  });
}

function renderAttachments(items = []) {
  const ul = document.getElementById("attachments-list");
  if (!ul) return;
  ul.innerHTML = "";
  items.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${a.url}" target="_blank" rel="noopener">${a.target}</a> ${a.note ? `— ${a.note}` : ""}`;
    ul.appendChild(li);
  });
}

async function loadProjectData(tech, project) {
  const dataRes = await fetch(`${API_BASE}/data`, { headers: { "ngrok-skip-browser-warning": "true" } });
  const data = await dataRes.json();
  const projectData = data.technicians?.[tech]?.projects?.[project];
  if (!projectData) {
    document.getElementById("project-name").textContent = "Project Not Found";
    return;
  }

  const tasks = (projectData.tasks || []).filter(t => !t.deletedAt);
  const materials = (projectData.materials || []).filter(m => !m.deletedAt);
  const scopeText = projectData.scope || "No scope of work provided.";
  const locationText = projectData.location || projectData.address || "";
  const contactText = projectData.siteContactName || projectData.siteContactPhone
    ? `${projectData.siteContactName || ''}${projectData.siteContactName && projectData.siteContactPhone ? ' · ' : ''}${projectData.siteContactPhone || ''}`
    : '';
  const locEl = document.getElementById("project-location");
  if (locEl) locEl.textContent = locationText ? `Location: ${locationText}` : "";
  const contactEl = document.getElementById("project-contact");
  if (contactEl) contactEl.textContent = contactText ? `Site Contact: ${contactText}` : "";
  document.getElementById("scope-text").textContent = scopeText;

  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";

    const subtasks = (task.subtasks || []).filter(st => !st.deletedAt);
    const subDone = subtasks.filter((st) => st.status === 1).length;
    const isComplete = subtasks.length > 0 ? subDone === subtasks.length : task.complete === true || task.status === 1;

    cb.checked = isComplete;
    cb.onchange = () => {
      updateStatus(tech, project, "task", task.name, cb.checked ? 1 : 0, () => loadProjectData(tech, project));
    };

    const label = document.createElement("span");
    label.textContent = ` ${task.name}`;
    label.className = "clickable-label";

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "admin-only";
    del.onclick = async () => {
      if (ctx.role !== "admin") return alert("Admin role required.");
      await apiPost("/deleteItem", { tech, project, type: "task", name: task.name, updatedBy: "Admin", role: ctx.role }, true);
      loadProjectData(tech, project);
    };

    const subUl = document.createElement("ul");
    subUl.classList.add("hidden");
    label.onclick = () => subUl.classList.toggle("hidden");

    subtasks.forEach((sub) => {
      const subLi = document.createElement("li");
      const subCb = document.createElement("input");
      subCb.type = "checkbox";
      subCb.checked = sub.status === 1;
      subCb.onchange = () => updateStatus(tech, project, "subtask", `${task.name}|${sub.name}`, subCb.checked ? 1 : 0, () => loadProjectData(tech, project));
      subLi.appendChild(subCb);
      subLi.append(` ${sub.name}`);
      subUl.appendChild(subLi);
    });

    const addSubBtn = document.createElement("button");
    addSubBtn.textContent = "+ Add Subtask";
    addSubBtn.className = "add-task-btn";
    addSubBtn.onclick = () => {
      if (!subUl.querySelector("input[type='text']")) {
        const inputLi = document.createElement("li");
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Subtask name";
        input.onkeydown = (e) => {
          if (e.key === "Enter" && input.value.trim()) {
            saveNewItem("subtask", `${task.name}|${input.value.trim()}`);
            inputLi.remove();
          }
        };
        inputLi.appendChild(input);
        subUl.appendChild(inputLi);
        input.focus();
      }
    };

    subUl.appendChild(addSubBtn);

    li.appendChild(cb);
    li.appendChild(label);
    li.appendChild(del);
    li.appendChild(subUl);
    taskList.appendChild(li);
  });

  const matList = document.getElementById("material-list");
  matList.innerHTML = "";
  const stages = ["Unchecked", "Picked up/on van", "On site", "Installed", "Returning"];
  const colors = ["#666", "gold", "red", "green", "blue"];

  materials.forEach((mat, index) => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    const stage = mat.stage ?? 0;
    cb.checked = stage > 0;
    cb.onclick = () => {
      const current = materials[index].stage ?? 0;
      const nextStage = (current + 1) % 5;
      updateStatus(tech, project, "material", mat.name, nextStage, () => loadProjectData(tech, project));
    };

    const label = document.createElement("span");
    label.textContent = ` ${mat.name}`;
    label.className = "clickable-label";

    const stageBtn = document.createElement("span");
    stageBtn.textContent = stages[stage] || stages[0];
    stageBtn.style.color = colors[stage] || "black";
    stageBtn.style.marginLeft = "0.5rem";
    stageBtn.style.cursor = "pointer";
    stageBtn.onclick = () => {
      const current = materials[index].stage ?? 0;
      const nextStage = (current + 1) % 5;
      updateStatus(tech, project, "material", mat.name, nextStage, () => loadProjectData(tech, project));
    };

    li.appendChild(cb);
    li.appendChild(label);
    li.appendChild(stageBtn);
    matList.appendChild(li);
  });

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
    if (subs.length) return sum + subs.filter((st) => st.status === 1).length;
    return sum + (t.complete ? 1 : 0);
  }, 0) + materials.reduce((sum, m) => sum + materialWeight(m.stage), 0);

  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progress-bar").style.width = `${percent}%`;
  document.getElementById("progress-bar").textContent = `${percent}%`;

  const tRes = await fetch(`${API_BASE}/timeline?tech=${encodeURIComponent(tech)}&project=${encodeURIComponent(project)}&limit=30`, { headers: { "ngrok-skip-browser-warning": "true" } });
  const tPayload = await tRes.json().catch(() => ({ entries: [] }));
  renderTimeline(tPayload.entries || []);
  renderAttachments(projectData.attachments || []);

  const summary = document.getElementById('time-summary');
  if (summary) {
    try {
      const rr = await fetch(`${API_BASE}/time-rollup?tech=${encodeURIComponent(tech)}&project=${encodeURIComponent(project)}`, { headers: { "ngrok-skip-browser-warning": "true" } });
      const rp = await rr.json();
      if (rr.ok) {
        const r = rp.rollup || {};
        summary.textContent = `Travel To: ${r.travel_to_minutes || 0}m · On Site: ${r.onsite_minutes || 0}m · Travel From: ${r.travel_from_minutes || 0}m · Break: ${r.break_minutes || 0}m · Total: ${r.total_minutes || 0}m`;
      } else {
        summary.textContent = 'No time rollup available.';
      }
    } catch {
      summary.textContent = 'No time rollup available.';
    }
  }

  setAdminOnlyButtons();
}

async function updateStatus(tech, project, type, name, status, callback) {
  try {
    await apiPost("/update", { tech, project, type, name, status, updatedBy: "Technician", role: ctx.role }, true);
    callback?.();
  } catch (err) {
    console.error("Update error:", err);
    alert(`Update failed: ${err.message}`);
  }
}

async function saveNewItem(type, name) {
  try {
    await apiPost("/addItem", { tech: ctx.tech, project: ctx.project, type, name, updatedBy: "Technician", role: ctx.role }, true);
    loadProjectData(ctx.tech, ctx.project);
  } catch (err) {
    console.error("Add error:", err);
    alert(err.message);
  }
}

function toggleSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("expanded");
}

function addTask() {
  const name = prompt("New task name:");
  if (name?.trim()) saveNewItem("task", name.trim());
}

function addMaterial() {
  const name = prompt("New material name:");
  if (name?.trim()) saveNewItem("material", name.trim());
}
