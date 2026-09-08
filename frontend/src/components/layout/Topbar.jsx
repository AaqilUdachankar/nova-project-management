import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import * as userService from "../../services/userService";
import Avatar from "../common/Avatar";
import { formatDate } from "../../utils/helpers";

const Topbar = ({ title, subtitle, action }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await userService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await userService.markAllAsRead();
      setUnreadCount(0);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-ink-50">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <div className="relative" ref={ref}>
          <button
            onClick={handleOpen}
            className="relative w-10 h-10 rounded-xl bg-white border border-ink-100 flex items-center justify-center hover:bg-ink-50 shadow-card"
          >
            <Bell size={18} className="text-ink-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-pop border border-ink-100 overflow-hidden z-20 animate-fade-in">
              <div className="px-4 py-3 border-b border-ink-100 font-display font-semibold text-sm text-ink-800">
                Notifications
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-400">
                    You're all caught up
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="flex gap-3 px-4 py-3 hover:bg-ink-50 border-b border-ink-50 last:border-0">
                      <Avatar name={n.sender?.name || "Nova"} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm text-ink-700 leading-snug">{n.message}</p>
                        <p className="text-xs text-ink-300 mt-0.5">{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
