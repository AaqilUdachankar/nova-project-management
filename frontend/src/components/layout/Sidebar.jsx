import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/my-tasks", label: "My Tasks", icon: CheckSquare },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-ink-900 text-ink-100 flex flex-col shrink-0 sticky top-0">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-8 h-8 rounded-lg bg-nova-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white">Nova</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-nova-500/15 text-white"
                  : "text-ink-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-1 rounded-xl text-sm text-ink-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
