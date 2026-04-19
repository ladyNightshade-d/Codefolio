import { useState, useEffect, useRef } from "react";

function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return { showConfetti, triggerConfetti };
}

function Confetti({ active }) {
  if (!active) return null;

  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    color: ["#00d4ff", "#f5a623", "#00e676", "#ff5555", "#a78bfa", "#fff"][i % 6],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="confetti-overlay">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}

export default function MyProjects({ openProject, addNotification }) {
  const [privacy, setPrivacy] = useState("public");
  const [status, setStatus] = useState("completed");
  const [projectName, setProjectName] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [published, setPublished] = useState(false);
  const { showConfetti, triggerConfetti } = useConfetti();
  const [projects, setProjects] = useState([
    { name: "NLP Classifier API", desc: "Deep learning REST API utilizing BERT for high-precision sentiment analysis.", field: "AI/ML", status: "Public", privacy: "public", date: "Apr 10, 2026", tags: [], views: 342, author: "alex-johnson", liveUrl: "" },
    { name: "E-Commerce Dashboard", desc: "Full-stack platform with real-time inventory tracking and dynamic payment processing.", field: "E-Commerce", status: "Public", privacy: "public", date: "Apr 5, 2026", tags: [], views: 210, author: "alex-johnson", liveUrl: "" },
  ]);

  const fields = ["Agriculture", "Cybersecurity", "Finance", "Education", "Health", "AI/ML", "E-Commerce", "Blockchain", "Other"];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  const handlePublish = () => {
    if (!projectName || !description) {
      alert("Project name and description are required!");
      return;
    }

    const newProject = {
      name: projectName,
      desc: description,
      field: field || "Other",
      status: privacy === "public" ? "Public" : "Private",
      privacy,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tags: [],
      views: 0,
      author: "alex-johnson",
      liveUrl,
    };

    setProjects(prev => [newProject, ...prev]);
    addNotification(`Your project "${projectName}" was published successfully!`);
    setPublished(true);
    triggerConfetti();
    setProjectName("");
    setDescription("");
    setField("");
    setLiveUrl("");
    setUploadedFile(null);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="page-content">
      <Confetti active={showConfetti} />
      <div className="upload-grid">
        <div className="upload-left">
          <div
            className={`drop-zone ${dragging ? "drop-zone-active" : ""} ${uploadedFile ? "drop-zone-uploaded" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input").click()}
          >
            <input id="file-input" type="file" style={{ display: "none" }}
              onChange={e => setUploadedFile(e.target.files[0]?.name)} />
            {uploadedFile ? (
              <>
                <div className="upload-success-icon">✅</div>
                <p className="drop-title">{uploadedFile}</p>
                <p className="drop-sub">File ready to upload</p>
              </>
            ) : (
              <>
                <div className="upload-arrow-icon">⬆</div>
                <p className="drop-title">Drop your project folder here</p>
                <p className="drop-sub">or click to browse — ZIP, folder, or repo link</p>
                <button className="browse-btn" onClick={e => { e.stopPropagation(); document.getElementById("file-input").click(); }}>
                  Browse Files
                </button>
              </>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">PROJECT NAME <span className="required">*</span></label>
            <input className="form-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Enter project name" />
          </div>

          <div className="form-section">
            <label className="form-label">DESCRIPTION <span className="required">*</span></label>
            <textarea className="form-input form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your project..." rows={3} />
          </div>

          <div className="form-section">
            <label className="form-label">FIELD</label>
            <select className="form-input form-select" value={field} onChange={e => setField(e.target.value)}>
              <option value="">Select a field</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">LIVE URL (OPTIONAL)</label>
            <div className="input-with-icon">
              <span className="input-icon-left">🔗</span>
              <input className="form-input with-icon" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://your-live-demo.com" />
            </div>
          </div>
        </div>

        <div className="upload-right">
          <div className="form-section">
            <label className="form-label">PRIVACY</label>
            <div className="toggle-grid">
              <button className={`toggle-card ${privacy === "public" ? "toggle-active" : ""}`} onClick={() => setPrivacy("public")}>
                <span className="toggle-icon">🌐</span>
                <div>
                  <div className="toggle-title">Public</div>
                  <div className="toggle-sub">Visible to everyone</div>
                </div>
              </button>
              <button className={`toggle-card ${privacy === "private" ? "toggle-active-private" : ""}`} onClick={() => setPrivacy("private")}>
                <span className="toggle-icon">🔒</span>
                <div>
                  <div className="toggle-title">Private</div>
                  <div className="toggle-sub">Only you can see this</div>
                </div>
              </button>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">STATUS</label>
            <div className="toggle-grid">
              <button className={`toggle-card ${status === "completed" ? "toggle-active" : ""}`} onClick={() => setStatus("completed")}>
                <span className="toggle-icon">✅</span>
                <div>
                  <div className="toggle-title">Completed</div>
                  <div className="toggle-sub">Finished node</div>
                </div>
              </button>
              <button className={`toggle-card ${status === "wip" ? "toggle-active" : ""}`} onClick={() => setStatus("wip")}>
                <span className="toggle-icon">🔧</span>
                <div>
                  <div className="toggle-title">WIP</div>
                  <div className="toggle-sub">Still building</div>
                </div>
              </button>
              <button className={`toggle-card ${status === "archived" ? "toggle-active" : ""}`} onClick={() => setStatus("archived")}>
                <span className="toggle-icon">📦</span>
                <div>
                  <div className="toggle-title">Archived</div>
                  <div className="toggle-sub">No longer active</div>
                </div>
              </button>
            </div>
          </div>

          <div className="action-btns">
            <button className="save-draft-btn">Save Draft</button>
            <button className={`publish-btn ${published ? "publish-success" : ""}`} onClick={handlePublish}>
              {published ? "Published!" : "Publish Project"}
            </button>
          </div>
        </div>
      </div>

      <div className="my-projects-list">
        <h2 className="section-title">My Projects <span className="projects-count">{projects.length}</span></h2>
        <div className="my-projects-grid">
          {projects.map((p, i) => (
<div key={i} className="my-project-card" style={{ animationDelay: `${i * 0.08}s` }}>
  <div className="my-project-top">
    <div className="my-project-badges">
      <span className={`status-badge ${p.status === "Public" ? "badge-public" : "badge-progress"}`}>
        {p.status}
      </span>
      <span className="privacy-badge">
        {p.privacy === "public" ? "🌐" : "🔒"} {p.privacy}
      </span>
    </div>
    <div className="my-project-top-right">
      <span className="my-project-date">{p.date}</span>
      <button
        className="delete-btn"
        onClick={e => {
          e.stopPropagation();
          setProjects(prev => prev.filter((_, idx) => idx !== i));
        }}
      >
        🗑
      </button>
    </div>
  </div>
  <div onClick={() => openProject(p)} style={{ cursor: "pointer" }}>
    <h3 className="my-project-name">{p.name}</h3>
    <p className="my-project-desc">{p.desc}</p>
    <div className="my-project-field">
      <span className="field-badge">{p.field}</span>
    </div>
  </div>
</div>
          ))}
        </div>
      </div>
    </div>
  );
}