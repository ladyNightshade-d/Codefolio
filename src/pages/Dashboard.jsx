const stats = [
  { label: "TOTAL PROJECTS", value: "24", sub: "↑ 3 this month" },
  { label: "PUBLIC NODES", value: "16", sub: "↑ 2 this week" },
  { label: "NETWORK VIEWS", value: "1.4K", sub: "↑ 12% vs last week" },
  { label: "SAVED ARCHIVES", value: "87", sub: "↓ 4 this week" },
];

const recentProjects = [
  { name: "NLP Classifier API", desc: "Deep learning REST API utilizing BERT for high-precision sentiment analysis.", status: "Public", field: "AI/ML", author: "alex-johnson", views: 342, tags: ["Python", "FastAPI", "PyTorch"], liveUrl: "" },
  { name: "E-Commerce Dashboard", desc: "Full-stack platform with real-time inventory tracking and dynamic payment processing.", status: "Public", field: "E-Commerce", author: "sara_dev", views: 210, tags: ["React", "Node.js", "MongoDB"], liveUrl: "" },
  { name: "Portfolio Analytics", desc: "View tracking and engagement dashboards for project portfolios.", status: "In Progress", field: "AI/ML", author: "alex-johnson", views: 98, tags: ["Vue", "D3.js"], liveUrl: "" },
];

const pulse = [
  { icon: "👁", msg: "Your NLP Classifier API received 18 new views today.", time: "2 hours ago" },
  { icon: "🚀", msg: "You uploaded a new version of Portfolio Analytics.", time: "Yesterday" },
  { icon: "🔖", msg: "User sara_dev bookmarked your E-Commerce Dashboard.", time: "2 days ago" },
];

export default function Dashboard({ navigate, openProject }) {
  return (
    <div className="page-content">
      <div className="page-header-bar">
        <span className="view-mode-tag">VIEW_MODE: DASHBOARD // ACCESS_GRANTED</span>
        <div className="header-orb" />
      </div>

      <div className="dashboard-top">
        <h1 className="page-title">System Overview</h1>
        <button className="new-node-btn" onClick={() => navigate("projects")}>+ New Project Node</button>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Recent Deployments</h2>
      <div className="projects-row">
        {recentProjects.map((p, i) => (
          <div key={i} className="project-card" style={{ animationDelay: `${i * 0.12}s` }}
            onClick={() => openProject(p)}>
            <div className="card-top-row">
              <span className={`status-badge ${p.status === "Public" ? "badge-public" : "badge-progress"}`}>{p.status}</span>
              <span className="card-bolt">⚡</span>
            </div>
            <h3 className="card-name">{p.name}</h3>
            <p className="card-desc">{p.desc}</p>
            <div className="card-tags">
              {p.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Network Pulse</h2>
      <div className="pulse-card">
        {pulse.map((item, i) => (
          <div key={i} className="pulse-item">
            <span className="pulse-icon">{item.icon}</span>
            <div className="pulse-content">
              <p className="pulse-msg">{item.msg}</p>
              <span className="pulse-time">🕐 {item.time}</span>
            </div>
            {i < pulse.length - 1 && <div className="pulse-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
}