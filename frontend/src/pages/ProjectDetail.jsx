import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Users, Settings, Plus } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Button from "../components/common/Button";
import AvatarStack from "../components/common/AvatarStack";
import KanbanColumn from "../components/tasks/KanbanColumn";
import TaskCard from "../components/tasks/TaskCard";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import NewTaskModal from "../components/tasks/NewTaskModal";
import MembersModal from "../components/projects/MembersModal";
import PageLoader from "../components/common/PageLoader";
import * as projectService from "../services/projectService";
import * as taskService from "../services/taskService";
import { useToast } from "../context/ToastContext";
import { useProjectRoom } from "../hooks/useSocket";

const COLUMNS = ["todo", "in-progress", "in-review", "done"];

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const toast = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadData = useCallback(async () => {
    const [projectData, tasksData] = await Promise.all([
      projectService.getProject(id),
      taskService.getProjectTasks(id),
    ]);
    setProject(projectData.project);
    setTasks(tasksData.tasks);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useProjectRoom(id, (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  });

  const tasksByStatus = (status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    // Determine the target column: either dropped over a column or over another task
    const overTask = tasks.find((t) => t._id === over.id);
    const newStatus = overTask ? overTask.status : over.id;

    if (!COLUMNS.includes(newStatus)) return;

    if (activeTask.status === newStatus && !overTask) return;

    const updatedTasks = tasks.map((t) =>
      t._id === activeTask._id ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const { task: saved } = await taskService.updateTask(activeTask._id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === saved._id ? saved : t)));
    } catch {
      toast.error("Failed to move task");
      loadData();
    }
  };

  const handleCreateTask = async (form) => {
    const { task } = await taskService.createTask({ ...form, project: id });
    setTasks((prev) => [...prev, task]);
    toast.success("Task created");
  };

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
    setSelectedTask(updated);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <Topbar
        title={project.name}
        subtitle={project.description || "No description"}
        action={
          <div className="flex items-center gap-2">
            <AvatarStack users={project.members?.map((m) => m.user)} max={4} />
            <Button variant="secondary" size="sm" icon={<Users size={15} />} onClick={() => setMembersOpen(true)}>
              Members
            </Button>
          </div>
        }
      />
      <div className="px-8 pb-10">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus(status)}
                onTaskClick={setSelectedTask}
                onAddTask={setNewTaskStatus}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetailModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        members={project.members}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
      <NewTaskModal
        open={!!newTaskStatus}
        onClose={() => setNewTaskStatus(null)}
        onSubmit={handleCreateTask}
        members={project.members}
        defaultStatus={newTaskStatus}
      />
      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        project={project}
        onUpdated={setProject}
      />
    </>
  );
};

export default ProjectDetail;
