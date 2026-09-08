import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, Search } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Button from "../components/common/Button";
import { EmptyState } from "../components/common/Misc";
import AvatarStack from "../components/common/AvatarStack";
import ProjectFormModal from "../components/projects/ProjectFormModal";
import * as projectService from "../services/projectService";
import { useToast } from "../context/ToastContext";
import PageLoader from "../components/common/PageLoader";

const statusColors = {
  planning: "#9A9AB8",
  active: "#5B54EC",
  "on-hold": "#F58B12",
  completed: "#22C55E",
  archived: "#6B6B90",
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const loadProjects = async () => {
    const data = await projectService.getProjects();
    setProjects(data.projects);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (form) => {
    await projectService.createProject(form);
    toast.success("Project created successfully");
    loadProjects();
  };

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <>
      <Topbar
        title="Projects"
        subtitle="All the projects you own or collaborate on"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            New project
          </Button>
        }
      />
      <div className="px-8 pb-10">
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-nova-200"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={40} />}
            title="No projects found"
            description="Create a new project to start organizing your team's work."
            action={<Button onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>New project</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="bg-white rounded-2xl border border-ink-100/60 shadow-card p-5 cursor-pointer hover:shadow-pop hover:-translate-y-0.5 transition-all"
                style={{ borderLeft: `4px solid ${p.color}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.key?.slice(0, 2)}
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                    style={{ backgroundColor: `${statusColors[p.status]}1A`, color: statusColors[p.status] }}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-ink-900 mb-1 truncate">{p.name}</h3>
                <p className="text-sm text-ink-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                  {p.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between">
                  <AvatarStack users={p.members?.map((m) => m.user)} />
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div className="h-full bg-nova-500" style={{ width: `${p.stats?.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-ink-400 w-8">{p.stats?.progress || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </>
  );
};

export default Projects;
