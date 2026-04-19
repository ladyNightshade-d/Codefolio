export default function ProjectDetail({ project, onBack }) {
  if (!project) return null;

  return (
    <div className="page-content">
      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      <div className="detail-wrapper">
        <div className="detail-header">
          <div className="detail-icon">Z</div>
          <div className="detail-header-info">
            <div className="detail-badges">
              <span className={`status-badge ${project.status === "Public" ? "badge-public" : "badge-progress"}`}>
                {project.status}
              </span>
              <span className="field-badge">{project.field}</span>
            </div>
            <h1 className="detail-title">{project.name}</h1>
            <div className="detail-author">
              <div className="author-avatar">
                {project.author ? project.author[0].toUpperCase() : "U"}
              </div>
              <span className="author-name">{project.author || "Unknown"}</span>
              <span className="author-views">Views: {project.views}</span>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-left">
            <div className="detail-section">
              <h2 className="detail-section-title">PROJECT DESCRIPTION</h2>
              <p className="detail-description">{project.desc}</p>
            </div>

            <div className="detail-section">
              <h2 className="detail-section-title">TECHNOLOGIES</h2>
              <div className="detail-tags">
                {project.tags.map((t, i) => (
                  <span key={i} className="detail-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-info-card">
              <div className="info-row">
                <span className="info-label">STATUS</span>
                <span className={`status-badge ${project.status === "Public" ? "badge-public" : "badge-progress"}`}>
                  {project.status}
                </span>
              </div>
              <div className="info-divider" />
              <div className="info-row">
                <span className="info-label">FIELD</span>
                <span className="info-value">{project.field}</span>
              </div>
              <div className="info-divider" />
              <div className="info-row">
                <span className="info-label">AUTHOR</span>
                <span className="info-value">{project.author || "Unknown"}</span>
              </div>
              <div className="info-divider" />
              <div className="info-row">
                <span className="info-label">VIEWS</span>
                <span className="info-value">{project.views}</span>
              </div>
              <div className="info-divider" />
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="live-url-btn">
                  View Live Demo
                </a>
              ) : (
                <div className="no-live-url">No live demo available</div>
              )}
            </div>
            <button className="detail-bookmark-btn">Bookmark Project</button>
          </div>
        </div>
      </div>
    </div>
  );
}