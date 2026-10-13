import "./GlobalSidebar.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂", key: "dashboard" },
  { label: "Tasks", path: "/tasks", icon: "✓", key: "tasks" },
  { label: "Subjects", path: "/subjects", icon: "▦", key: "subjects" },
  { label: "Study Sessions", path: "/study-sessions", icon: "◷", key: "study-sessions" },
  { label: "Coding Platforms", path: "/coding-platforms", icon: "</>", key: "coding-platforms" },
  { label: "Study Analytics", path: "/analytics", icon: "▥", key: "analytics" },
];

function GlobalSidebar({ active }) {
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.location.assign(path);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("student");
      window.location.assign("/");
    }
  };

  return (
    <aside className="global-sidebar">
      <div className="global-sidebar-top">
        <a className="global-brand" href="/dashboard" aria-label="StudySync dashboard">
          Study<span>Sync</span>
        </a>
        <p className="global-brand-caption">Student workspace</p>

        <nav className="global-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={active === item.key ? "global-nav-item active" : "global-nav-item"}
              aria-current={active === item.key ? "page" : undefined}
              onClick={() => navigate(item.path)}
            >
              <span className="global-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <button className="global-logout" type="button" onClick={logout}>
        Log out
      </button>
    </aside>
  );
}

export default GlobalSidebar;
