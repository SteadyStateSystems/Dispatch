document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tech = params.get("tech");
  const project = params.get("project");
  document.getElementById("project-name").textContent = project;

  loadProjectData(tech, project);
});

function loadProjectData(tech, project) {
  fetch("https://adjusted-bluejay-gratefully.ngrok-free.app/data", {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  })
    .then(res => res.json())
    .then(data => {
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

        tasks.forEach(task => {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";

        const subtasks = task.subtasks || [];
        const subDone = subtasks.filter(st => st.status === 1).length;
        const isComplete = subtasks.length > 0
          ? subDone === subtasks.length
          : task.completed === true || task.status === 1;

        cb.checked = isComplete;

        const label = document.createElement("span");
        label.textContent = ` ${task.name}`;
        label.className = "clickable-label";

        const subUl = document.createElement("ul");
        subUl.classList.add("hidden");

        label.onclick = () => {
          subUl.classList.toggle("hidden");
        };

        subtasks.forEach(sub => {
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

        // 🔹 Add Subtask Button
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
      subUl.removeChild(liToRemove); // 🧹 removes the input row
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
      const stages = ["Picked up/on van", "On site", "Installed", "Returning"];
      const colors = ["gold", "red", "green", "blue"];

      materials.forEach((mat, index) => {
        const li = document.createElement("li");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        const stage = mat.stage ?? mat.status ?? 0;
        cb.checked = stage > 0;
        cb.onclick = () => {
          const current = materials[index].stage ?? 0;
          const nextStage = (current + 1) % 4;
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
          const nextStage = (current + 1) % 4;
          updateStatus(tech, project, "material", mat.name, nextStage, () => loadProjectData(tech, project));
        };

        const subUl = document.createElement("ul");
        subUl.classList.add("hidden");

        label.onclick = () => {
          subUl.classList.toggle("hidden");
        };

        const subMaterials = mat.submaterials || [];
        subMaterials.forEach(sub => {
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

        li.appendChild(cb);
        li.appendChild(label);
        li.appendChild(stageBtn);
        // 🔹 Add Sub-Material Button
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
    subUl.removeChild(liToRemove); // 🧹 remove input row
  }
};
    inputLi.appendChild(input);
    subUl.appendChild(inputLi);
    input.focus();
  }
};

subUl.appendChild(addSubMatBtn);

        li.appendChild(subUl);
        matList.appendChild(li);
      });

      const total = tasks.reduce((sum, t) => sum + (t.subtasks?.length || 1), 0) + materials.length;
      const done = tasks.reduce((sum, t) => {
        if (t.subtasks?.length) {
          return sum + t.subtasks.filter(st => st.status === 1).length;
        } else {
          return sum + ((t.completed || t.status === 1) ? 1 : 0);
        }
      }, 0) + materials.filter(m => (m.stage ?? m.status) === 3).length;

      const percent = total ? Math.round((done / total) * 100) : 0;

      document.getElementById("progress-bar").style.width = `${percent}%`;
      document.getElementById("progress-bar").textContent = `${percent}%`;
      const percentText = document.getElementById("progress-percent");
      if (percentText) percentText.textContent = `${percent}%`;
    });
}

function updateStatus(tech, project, type, name, status, callback) {
  fetch("https://adjusted-bluejay-gratefully.ngrok-free.app/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tech,
      project,
      type,
      name,
      status,
      updatedBy: "Technician"
    })
  })
    .then(res => res.text())
    .then(text => {
      if (text === "Success") {
        callback?.();
      } else {
        console.error("Update failed:", text);
      }
    })
    .catch(err => console.error("Update error:", err));
}

function saveNewItem(type, name) {
  const params = new URLSearchParams(window.location.search);
  const tech = params.get("tech");
  const project = params.get("project");

  fetch("https://adjusted-bluejay-gratefully.ngrok-free.app/addItem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tech,
      project,
      type,
      name,
      updatedBy: "Technician"
    })
  })
    .then(res => res.text())
    .then(res => {
      if (res === "Success") {
        loadProjectData(tech, project); // ✅ Refresh data on success
      } else {
        alert("Failed to add " + type);
      }
    })
    .catch(err => console.error("Add error:", err));
}

// ✅ Handles main collapsibles (Tasks, Materials, Scope)
function toggleSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("expanded");
}


function addTask() {
  const name = prompt("New task name:");
  if (name?.trim()) {
    saveNewItem("task", name.trim());
  }
}

/**
 * Prompt for a new material name and save it.
 */
function addMaterial() {
  const name = prompt("New material name:");
  if (name?.trim()) {
    saveNewItem("material", name.trim());
  }
}