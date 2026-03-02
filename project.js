const API_BASE = "https://adjusted-bluejay-gratefully.ngrok-free.app";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tech = params.get("tech");
  const project = params.get("project");
  document.getElementById("project-name").textContent = project || "Project";

  loadProjectData(tech, project);
});

function loadProjectData(tech, project) {
  fetch(`${API_BASE}/data`, {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  })
    .then((res) => res.json())
    .then((data) => {
      const projectData = data.technicians?.[tech]?.projects?.[project];
      if (!projectData) {
        document.getElementById("project-name").textContent = "Project Not Found";
        return;
      }

      const tasks = projectData.tasks || [];
      const materials = projectData.materials || [];
      const scopeText = projectData.scope || "No scope of work provided.";
      document.getElementById("scope-text").textContent = scopeText;

      const taskList = document.getElementById("task-list");
      taskList.innerHTML = "";

      tasks.forEach((task) => {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";

        const subtasks = task.subtasks || [];
        const subDone = subtasks.filter((st) => st.status === 1).length;
        const isComplete = subtasks.length > 0
          ? subDone === subtasks.length
          : task.complete === true || task.completed === true || task.status === 1;

        cb.checked = isComplete;
        cb.onchange = () => {
          updateStatus(tech, project, "task", task.name, cb.checked ? 1 : 0, () => loadProjectData(tech, project));
        };

        const label = document.createElement("span");
        label.textContent = ` ${task.name}`;
        label.className = "clickable-label";

        const subUl = document.createElement("ul");
        subUl.classList.add("hidden");

        label.onclick = () => {
          subUl.classList.toggle("hidden");
        };

        subtasks.forEach((sub) => {
          const subLi = document.createElement("li");
          const subCb = document.createElement("input");
          subCb.type = "checkbox";
          subCb.checked = sub.status === 1;
          subCb.onchange = () => {
            updateStatus(tech, project, "subtask", `${task.name}|${sub.name}`, subCb.checked ? 1 : 0, () => loadProjectData(tech, project));
          };
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
                const liToRemove = input.parentElement;
                saveNewItem("subtask", `${task.name}|${input.value.trim()}`);
                subUl.removeChild(liToRemove);
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
        const stage = mat.stage ?? mat.status ?? 0;
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

        const subUl = document.createElement("ul");
        subUl.classList.add("hidden");

        label.onclick = () => {
          subUl.classList.toggle("hidden");
        };

        const subMaterials = mat.submaterials || [];
        subMaterials.forEach((sub) => {
          const subLi = document.createElement("li");
          const subCb = document.createElement("input");
          subCb.type = "checkbox";
          subCb.checked = sub.status === 1;
          subCb.onchange = () => {
            updateStatus(tech, project, "submaterial", `${mat.name}|${sub.name}`, subCb.checked ? 1 : 0, () => loadProjectData(tech, project));
          };
          subLi.appendChild(subCb);
          subLi.append(` ${sub.name}`);
          subUl.appendChild(subLi);
        });

        const addSubMatBtn = document.createElement("button");
        addSubMatBtn.textContent = "+ Add Sub-Material";
        addSubMatBtn.className = "add-task-btn";
        addSubMatBtn.onclick = () => {
          if (!subUl.querySelector("input[type='text']")) {
            const inputLi = document.createElement("li");
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Sub-material name";
            input.onkeydown = (e) => {
              if (e.key === "Enter" && input.value.trim()) {
                const liToRemove = input.parentElement;
                saveNewItem("submaterial", `${mat.name}|${input.value.trim()}`);
                subUl.removeChild(liToRemove);
              }
            };
            inputLi.appendChild(input);
            subUl.appendChild(inputLi);
            input.focus();
          }
        };

        subUl.appendChild(addSubMatBtn);

        li.appendChild(cb);
        li.appendChild(label);
        li.appendChild(stageBtn);
        li.appendChild(subUl);
        matList.appendChild(li);
      });

      const materialWeight = (stage) => {
        const s = Number(stage ?? 0);
        if (s === 1) return 0.25;
        if (s === 2) return 0.5;
        if (s === 3 || s === 4) return 1;
        return 0;
      };

      const total = tasks.reduce((sum, t) => sum + (t.subtasks?.length || 1), 0) + materials.length;
      const done = tasks.reduce((sum, t) => {
        if (t.subtasks?.length) {
          return sum + t.subtasks.filter((st) => st.status === 1).length;
        }
        return sum + ((t.complete || t.completed || t.status === 1) ? 1 : 0);
      }, 0) + materials.reduce((sum, m) => sum + materialWeight(m.stage ?? m.status), 0);

      const percent = total ? Math.round((done / total) * 100) : 0;

      document.getElementById("progress-bar").style.width = `${percent}%`;
      document.getElementById("progress-bar").textContent = `${percent}%`;
      const percentText = document.getElementById("progress-percent");
      if (percentText) percentText.textContent = `${percent}%`;
    });
}

function updateStatus(tech, project, type, name, status, callback) {
  fetch(`${API_BASE}/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify({
      tech,
      project,
      type,
      name,
      status,
      updatedBy: "Technician"
    })
  })
    .then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.success === false) {
        throw new Error(payload.error || "Update failed");
      }
      callback?.();
    })
    .catch((err) => {
      console.error("Update error:", err);
      alert(`Update failed: ${err.message}`);
    });
}

function saveNewItem(type, name) {
  const params = new URLSearchParams(window.location.search);
  const tech = params.get("tech");
  const project = params.get("project");

  fetch(`${API_BASE}/addItem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify({
      tech,
      project,
      type,
      name,
      updatedBy: "Technician"
    })
  })
    .then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.success === false) {
        throw new Error(payload.error || `Failed to add ${type}`);
      }
      loadProjectData(tech, project);
    })
    .catch((err) => {
      console.error("Add error:", err);
      alert(err.message);
    });
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
