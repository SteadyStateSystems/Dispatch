const technicianContainer = document.getElementById("technicianContainer");
const API_BASE = "https://adjusted-bluejay-gratefully.ngrok-free.app";

fetch(`${API_BASE}/data`, {
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
})
  .then((res) => {
    if (!res.ok) throw new Error("Server error");
    return res.json();
  })
  .then((data) => {
    if (!data.technicians) throw new Error("Invalid JSON structure");

    Object.entries(data.technicians).forEach(([techName, techData]) => {
      const techCard = document.createElement("div");
      techCard.className = "tech-section";

      const techHeader = document.createElement("div");
      techHeader.className = "tech-header";
      techHeader.textContent = techName;
      techCard.appendChild(techHeader);

      const projectList = document.createElement("div");
      projectList.className = "project-list";
      projectList.style.display = "none";

      Object.entries(techData.projects || {}).forEach(([projectName, project]) => {
        const completion = calculateCompletion(project.tasks);
        const entry = document.createElement("div");
        entry.className = "project-entry";
        entry.innerHTML = `
          <strong>${projectName}</strong><br/>
          ${completion}% Complete
          <div class="progress-bar"><div class="progress-fill" style="width:${completion}%"></div></div>
        `;

        entry.addEventListener("click", () => {
          const url = `project.html?tech=${encodeURIComponent(techName)}&project=${encodeURIComponent(projectName)}`;
          window.location.href = url;
        });

        projectList.appendChild(entry);
      });

      const addBtn = document.createElement("button");
      addBtn.textContent = "+ Add Project";
      addBtn.className = "add-task-btn add-project-btn";
      addBtn.style.display = "none";
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
  })
  .catch((err) => {
    console.error("Failed to load project data:", err);
    technicianContainer.innerHTML = `<p style="color:red">Failed to load project data.</p>`;
  });

function calculateCompletion(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.complete === true || t.completed === true).length;
  return Math.round((completed / tasks.length) * 100);
}
