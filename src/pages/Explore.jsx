import { useState } from "react";

const allProjects = [
  { name: "NLP Classifier API", desc: "REST API wrapping a fine-tuned BERT model for sentiment and intent classification...", author: "alex-johnson", views: 342, status: "Public", field: "AI/ML", tags: ["Python", "FastAPI", "PyTorch"], liveUrl: "" },
  { name: "E-Commerce Dashboard", desc: "Full-stack platform with real-time inventory tracking and dynamic payment processing.", author: "sara_dev", views: 210, status: "Public", field: "E-Commerce", tags: ["React", "Node.js", "MongoDB"], liveUrl: "" },
  { name: "CropYield Predictor", desc: "ML model that predicts agricultural yield based on weather and soil data.", author: "jean_paul", views: 89, status: "Public", field: "Agriculture", tags: ["Python", "scikit-learn"], liveUrl: "" },
  { name: "BlockVault", desc: "Decentralized vault for secure document storage using Solidity smart contracts.", author: "mutoni_k", views: 174, status: "Public", field: "Blockchain", tags: ["Solidity", "Web3.js"], liveUrl: "" },
  { name: "RwandaCyberShield", desc: "Intrusion detection system for small businesses in Rwanda.", author: "eric_dev", views: 56, status: "Public", field: "Cybersecurity", tags: ["Python", "Snort"], liveUrl: "" },
  { name: "MicroFinance Tracker", desc: "Mobile-first app for tracking microfinance loans and repayments.", author: "alice_rw", views: 133, status: "Public", field: "Finance", tags: ["React Native", "Firebase"], liveUrl: "" },
];

const fields = ["All", "AI/ML", "Agriculture", "Cybersecurity", "Finance", "E-Commerce", "Blockchain", "Education", "Health"];

export default function Explore({ openProject }) {
  const [search, setSearch] = useState("");
  const [activeField, setActiveField] = useState("All");

  const filtered = allProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesField = activeField === "All" || p.field === activeField;
    return matchesSearch && matchesField;
  });

  return (
    <div className="page-content">
      <div className="page-header-bar">
        <span className="view-mode-tag">VIEW_MODE: EXPLORE // ACCESS_GRANTED</span>
        <div className="header-orb" />
      </div>

      <h1 className="page-title centered">Explore Network</h1>

      <div className="search-bar-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects, fields, technologies..."
        />
      </div>

      <div className="filter-chips">
        {fields.map(f => (
          <button
            key={f}
            className={`filter-chip ${activeField === f ? "filter-chip-active" : ""}`}
            onClick={() => setActiveField(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="explore-results">
        {filtered.length === 0 ? (
          <div className="no-results">No projects found matching your search.</div>
        ) : (
          filtered.map((p, i) => (
            <div key={i} className="explore-card" style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => openProject(p)}>
              <div className="explore-card-left">
                <div className="explore-card-icon">⚡</div>
              </div>
              <div className="explore-card-body">
                <h3 className="explore-card-name">{p.name}</h3>
                <p className="explore-card-desc">{p.desc}</p>
                <div className="explore-card-meta">
                  <span className="meta-author">{p.author}</span>
                  <span className="meta-views">👁 {p.views} views</span>
                  <span className="meta-status public">Public</span>
                  <span className="meta-field">{p.field}</span>
                </div>
                <div className="card-tags">
                  {p.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}
                </div>
              </div>
              <button className="bookmark-btn" onClick={e => e.stopPropagation()}>🔖</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}