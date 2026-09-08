import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import { statusMeta } from "../../utils/helpers";

const KanbanColumn = ({ status, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef } = useDroppable({ id: status });
  const meta = statusMeta[status];

  return (
    <div className="flex flex-col w-[300px] shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
          <h3 className="font-display font-semibold text-sm text-ink-700">{meta.label}</h3>
          <span className="text-xs text-ink-300 bg-ink-100 px-1.5 py-0.5 rounded-md">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="text-ink-300 hover:text-nova-500 p-1 rounded-lg hover:bg-nova-50"
        >
          <Plus size={16} />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 bg-ink-100/50 rounded-2xl p-2.5 min-h-[200px] max-h-[calc(100vh-260px)] overflow-y-auto"
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-ink-300 border-2 border-dashed border-ink-200 rounded-xl">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
