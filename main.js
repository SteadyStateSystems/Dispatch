const technicianContainer = document.getElementById("technicianContainer");

fetch("https://adjusted-bluejay-gratefully.ngrok-free.app/data", {
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
      projectList.style.display = "none";

     Object.entries(techData.projects || {}).forEach(([projectName, project]) => {
  const entry = document.createElement("div");
  entry.className = "project-entry";
  entry.innerHTML = `
    <strong>${projectName}</strong><br/>
    ${calculateCompletion(project.tasks)}% Complete
    <div class="progress-bar"><div class="progress-fill" style="width:${calculateCompletion(project.tasks)}%"></div></div>
  `;

  entry.addEventListener("click", () => {
    const url = `project.html?tech=${encodeURIComponent(techName)}&project=${encodeURIComponent(projectName)}`;
    window.location.href = url;
  });

  projectList.appendChild(entry);
});

      techHeader.addEventListener("click", () => {
        projectList.style.display = projectList.style.display === "none" ? "block" : "none";
      });

      techCard.appendChild(projectList);
      const addBtn = document.createElement("button");
  addBtn.textContent = "+ Add Project";
  addBtn.className = "add-task-btn";           // matches your CSS styles
  addBtn.onclick = () => {
    const overlay = document.getElementById("addProjectOverlay");
    overlay.style.display = "block";
    // auto-select this technician in the form
    overlay.querySelector('select[name="technician"]').value = techName;
  };
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
  const completed = tasks.filter(t => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}