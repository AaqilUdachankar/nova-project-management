import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import PageLoader from "../components/common/PageLoader";
import { EmptyState } from "../components/common/Misc";
import { Badge } from "../components/common/Misc";
import AvatarStack from "../components/common/AvatarStack";
import * as taskService from "../services/taskService";
import { priorityStyles, statusMeta, formatDate, isOverdue } from "../utils/helpers";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    taskService.getMyTasks().then((data) => {
      setTasks(data.tasks);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <>
      <Topbar title="My Tasks" subtitle="Everything assigned to you, across every project" />
      <div className="px-8 pb-10">
        <div className="flex gap-2 mb-5">
          {["all", ...Object.keys(statusMeta)].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === s ? "bg-nova-500 text-white" : "bg-white text-ink-500 border border-ink-100 hover:bg-ink-50"
              }`}
            >
              {s === "all" ? "All" : statusMeta[s].label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<CheckSquare size={40} />} title="No tasks here" description="Tasks assigned to you will show up in this list." />
        ) : (
          <div className="bg-white rounded-2xl border border-ink-100/60 shadow-card divide-y divide-ink-50">
            {filtered.map((t) => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50/60">
                <span className={`w-2 h-2 rounded-full shrink-0 ${priorityStyles[t.priority].dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={t.project?.color || "#5B54EC"} className="!px-2 !py-0.5">
                      {t.project?.key}
                    </Badge>
                    <span className="text-xs text-ink-300" style={{ color: statusMeta[t.status].color }}>
                      {statusMeta[t.status].label}
                    </span>
                  </div>
                </div>
                {t.dueDate && (
                  <span className={`text-sm shrink-0 ${isOverdue(t.dueDate, t.status) ? "text-rose-500 font-medium" : "text-ink-400"}`}>
                    {formatDate(t.dueDate)}
                  </span>
                )}
                <AvatarStack users={t.assignees} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyTasks;
