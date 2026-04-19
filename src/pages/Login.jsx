import { useState } from "react";

export default function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleConnect = (e) => {
    e.preventDefault();
    navigate("dashboard");
  };

  return (
    <div className="login-root">
      <div className="orbs-bg">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="orb" style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 20 + 8}px`,
            left: `${60 + Math.random() * 38}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#00d4ff" strokeWidth="2"/>
                <path d="M12 20 L20 12 L28 20 L20 14 Z" fill="#00d4ff"/>
                <circle cx="20" cy="22" r="3" fill="#00d4ff"/>
              </svg>
            </div>
            <span className="logo-text">KORVEX</span>
          </div>

          <h2 className="signin-title">Sign In</h2>
          <p className="signin-sub">Access your project repository</p>

          <form onSubmit={handleConnect} className="signin-form">
            <div className="input-group">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="login-input"
              />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            <button type="submit" className="connect-btn">CONNECT</button>
          </form>
        </div>

        <div className="login-right">
          <h1 className="project-central-title">Project Central</h1>
          <p className="project-central-sub">
            The ultimate ecosystem to upload, describe, and share your project architecture.
          </p>
          <div className="feature-list">
            <div className="feature-item"><span className="feature-icon">📋</span> Upload Docs</div>
            <div className="feature-item"><span className="feature-icon">🔗</span> Public Share</div>
            <div className="feature-item"><span className="feature-icon">🚀</span> Deploy Idea</div>
          </div>
          <div className="project-chips">
            {["E-Commerce", "Blockchain", "AI Chat", "Finance"].map((chip, i) => (
              <div key={i} className="project-chip" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="chip-title">{chip}</div>
                <div className="chip-sub">{["System Built", "Node Uploaded", "Active", "In Progress"][i]}</div>
              </div>
            ))}
          </div>
          <button className="get-started-btn" onClick={() => navigate("dashboard")}>Get Started</button>
        </div>
      </div>
    </div>
  );
}