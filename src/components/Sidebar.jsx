import { useState } from "react";

export default function Sidebar({ currentPage, navigate, onLogout, notifications, setNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "projects", label: "My Projects", icon: "🗂" },
    { id: "explore", label: "Explore", icon: "◎" },
    { id: "ai", label: "AI Assistant", icon: "💬", dot: true },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-k">K</div>
        <span className="logo-name">KORVEX</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? "nav-active" : ""}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.dot && <span className="nav-dot" />}
          </button>
        ))}

        <div className="notif-wrapper">
          <button
            className={`nav-item ${showNotifications ? "nav-active" : ""}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifications</span>
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span className="notif-panel-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.read ? "notif-unread" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="notif-item-icon">{n.icon}</span>
                    <div className="notif-item-body">
                      <p className="notif-item-msg">{n.msg}</p>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                    {!n.read && <span className="notif-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <button className="deauth-btn" onClick={onLogout}>
        <span>↪</span> De-authorize
      </button>
    </aside>
  );
}