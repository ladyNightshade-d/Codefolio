export default function Profile() {
  const publicNodes = [
    { name: "NLP Classifier API", desc: "Deep learning REST API utilizing BERT for high-precision sentiment analysis and intent detection.", tags: ["Python", "FastAPI", "PyTorch"] },
    { name: "E-Commerce Dashboard", desc: "Full-stack platform with real-time inventory tracking and dynamic payment processing.", tags: ["React", "Node.js", "MongoDB"] },
    { name: "Portfolio Analytics", desc: "View tracking and engagement dashboards for project portfolios.", tags: ["Vue", "D3.js"] },
  ];

  return (
    <div className="page-content">
      <div className="profile-header">
        <div className="profile-avatar">AJ</div>
        <div className="profile-info">
          <h1 className="profile-name">Alex Johnson</h1>
          <p className="profile-bio">
            Full-stack developer focused on neural network architecture and high-performance APIs.
            Currently expanding the Korvex node ecosystem.
          </p>
          <div className="profile-actions">
            <button className="edit-profile-btn">✏️ Edit Profile</button>
            <button className="share-node-btn">🔗 Share Node</button>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        {[
          { label: "TOTAL PROJECTS", value: "24" },
          { label: "PUBLIC NODES", value: "16" },
          { label: "NETWORK VIEWS", value: "1.4K" },
        ].map((s, i) => (
          <div key={i} className="profile-stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title centered">My Public Nodes</h2>
      <div className="public-nodes-grid">
        {publicNodes.map((node, i) => (
          <div key={i} className="public-node-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <h3 className="node-name">{node.name}</h3>
            <p className="node-desc">{node.desc}</p>
            <div className="card-tags">
              {node.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}