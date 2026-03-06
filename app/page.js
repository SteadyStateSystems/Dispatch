import { dashboard } from '../lib/data';

const navItems = ['Task Board', 'Calendar', 'Projects', 'Memories', 'Docs', 'Team', 'Office'];

function Card({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="dot" />
          <div>
            <p className="muted">Jarvis</p>
            <h1>Mission Control</h1>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <a key={item} className={`navItem ${item === 'Task Board' ? 'active' : ''}`} href="#" aria-disabled>
              {item}
            </a>
          ))}
        </nav>
        <p className="sidebarNote">Read-only view. No dashboard input is sent to the agent.</p>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <h2>Task Board</h2>
            <p className="muted">Live visibility into work, schedule, projects, memory, docs, and agent structure.</p>
          </div>
          <div className="statusPill">Public read-only</div>
        </header>

        <section className="statsGrid">
          {dashboard.kpis.map((kpi) => (
            <Card key={kpi.label} title={kpi.label}>
              <p className="kpi">{kpi.value}</p>
              <p className="muted">{kpi.note}</p>
            </Card>
          ))}
        </section>

        <section className="boardGrid">
          {dashboard.columns.map((col) => (
            <Card key={col.name} title={col.name}>
              <div className="taskList">
                {col.items.map((item) => (
                  <article key={item.id} className="taskCard">
                    <p className="taskTitle">{item.title}</p>
                    <p className="muted">Owner: {item.owner}</p>
                  </article>
                ))}
              </div>
            </Card>
          ))}
        </section>

        <section className="lowerGrid">
          <Card title="Live Activity Feed">
            <ul className="feed">
              {dashboard.activity.map((event, idx) => (
                <li key={idx}>
                  <span>{event.time}</span>
                  <p>{event.text}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Helpful Modules from Video">
            <ul className="modules">
              {dashboard.modules.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong>
                  <p className="muted">{m.desc}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </main>
  );
}
