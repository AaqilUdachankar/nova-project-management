import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import { useAuth } from "../context/AuthContext";
import * as projectService from "../services/projectService";
import * as taskService from "../services/taskService";
import AvatarStack from "../components/common/AvatarStack";
import { Badge } from "../components/common/Misc";
import { priorityStyles, formatDate, isOverdue } from "../utils/helpers";
import PageLoader from "../components/common/PageLoader";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card border border-ink-100/60">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-2xl font-display font-bold text-ink-900">{value}</p>
    <p className="text-sm text-ink-400 mt-0.5">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsData, tasksData] = await Promise.all([
          projectService.getProjects(),
          taskService.getMyTasks(),
        ]);
        setProjects(projectsData.projects);
        setMyTasks(tasksData.tasks);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const activeTasks = myTasks.filter((t) => t.status !== "done");
  const completedTasks = myTasks.filter((t) => t.status === "done");
  const overdueTasks = myTasks.filter((t) => isOverdue(t.dueDate, t.status));

  return (
    <>
      <Topbar
        title={`Welcome back, ${user?.name?.split(" ")[0]}`}
        subtitle="Here's what's happening across your projects today."
      />
      <div className="px-8 pb-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FolderKanban} label="Active projects" value={projects.length} color="#5B54EC" />
          <StatCard icon={Clock} label="Tasks in progress" value={activeTasks.length} color="#F58B12" />
          <StatCard icon={CheckCircle2} label="Completed tasks" value={completedTasks.length} color="#22C55E" />
          <StatCard icon={AlertTriangle} label="Overdue tasks" value={overdueTasks.length} color="#EF4444" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-ink-100/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-ink-900">Your projects</h2>
              <button
                onClick={() => navigate("/projects")}
                className="text-sm text-nova-600 font-medium flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-ink-100 hover:border-nova-200 hover:bg-nova-50/40 cursor-pointer transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.key?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-ink-100 rounded-full max-w-[140px] overflow-hidden">
                        <div
                          className="h-full bg-nova-500 rounded-full"
                          style={{ width: `${p.stats?.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-400">{p.stats?.progress || 0}%</span>
                    </div>
                  </div>
                  <AvatarStack users={p.members?.map((m) => m.user)} />
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-8">
                  No projects yet. Create your first one to get started.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-ink-100/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-ink-900">My tasks</h2>
              <button
                onClick={() => navigate("/my-tasks")}
                className="text-sm text-nova-600 font-medium flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {activeTasks.slice(0, 6).map((t) => (
                <div key={t._id} className="flex items-start gap-3 pb-3 border-b border-ink-50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityStyles[t.priority].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-700 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="#9A9AB8" className="!px-2 !py-0.5">{t.project?.key}</Badge>
                      {t.dueDate && (
                        <span className={`text-xs ${isOverdue(t.dueDate, t.status) ? "text-rose-500" : "text-ink-300"}`}>
                          {formatDate(t.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {activeTasks.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-8">You're all caught up 🎉</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
