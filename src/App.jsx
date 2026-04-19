import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyProjects from "./pages/MyProjects";
import Explore from "./pages/Explore";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import Sidebar from "./components/Sidebar";

const initialNotifications = [
  { id: 1, icon: "👁", msg: "alex-johnson viewed your NLP Classifier API", time: "2 hours ago", read: false },
  { id: 2, icon: "🔖", msg: "sara_dev bookmarked your E-Commerce Dashboard", time: "5 hours ago", read: false },
  { id: 3, icon: "✅", msg: "Your project Portfolio Analytics was published successfully", time: "Yesterday", read: false },
  { id: 4, icon: "💬", msg: "mutoni_k commented on your BlockVault project", time: "2 days ago", read: true },
  { id: 5, icon: "👁", msg: "eric_dev viewed your Portfolio Analytics", time: "2 days ago", read: true },
];

export default function App() {
  const [page, setPage] = useState("login");
  const [selectedProject, setSelectedProject] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [notifications, setNotifications] = useState(initialNotifications);

  const navigate = (p) => setPage(p);

  const openProject = (project, from) => {
    setPrevPage(from);
    setSelectedProject(project);
    setPage("detail");
  };

  const goBack = () => {
    setPage(prevPage || "dashboard");
    setSelectedProject(null);
  };

  const logout = () => setPage("login");

  const addNotification = (msg) => {
    const newNotif = {
      id: Date.now(),
      icon: "✅",
      msg,
      time: "Just now",
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  if (page === "login") return <Login navigate={navigate} />;

  if (page === "detail") return (
    <div className="app-root">
      <Sidebar currentPage={prevPage} navigate={navigate} onLogout={logout} notifications={notifications} setNotifications={setNotifications} />
      <main className="main-area">
        <ProjectDetail project={selectedProject} onBack={goBack} />
      </main>
    </div>
  );

  const pages = {
    dashboard: <Dashboard navigate={navigate} openProject={(p) => openProject(p, "dashboard")} />,
    projects: <MyProjects openProject={(p) => openProject(p, "projects")} addNotification={addNotification} />,
    explore: <Explore openProject={(p) => openProject(p, "explore")} />,
    ai: <AIAssistant />,
    profile: <Profile />,
  };

  return (
    <div className="app-root">
      <Sidebar currentPage={page} navigate={navigate} onLogout={logout} notifications={notifications} setNotifications={setNotifications} />
      <main className="main-area">
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}