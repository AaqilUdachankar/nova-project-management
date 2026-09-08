import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, CheckSquare, AlertCircle } from "lucide-react";
import AvatarStack from "../common/AvatarStack";
import { priorityStyles, formatDate, isOverdue } from "../../utils/helpers";

const TaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white rounded-xl border border-ink-100 p-3.5 cursor-pointer hover:border-nova-300 hover:shadow-card transition-all mb-2.5 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${priorityStyles[task.priority].bg} ${priorityStyles[task.priority].text}`}>
          {priorityStyles[task.priority].label}
        </span>
        {overdue && <AlertCircle size={14} className="text-rose-500" />}
      </div>
      <p className="text-sm font-medium text-ink-800 mb-2.5 leading-snug group-hover:text-nova-600">
        {task.title}
      </p>
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {task.labels.slice(0, 3).map((l, i) => (
            <span key={i} className="text-[10px] bg-ink-50 text-ink-500 px-2 py-0.5 rounded-full">
              {l}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-ink-300">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare size={13} /> {task.comments.length}
            </span>
          )}
          {task.subtasks?.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <CheckSquare size={13} /> {completedSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-xs ${overdue ? "text-rose-500 font-medium" : ""}`}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <AvatarStack users={task.assignees} size="xs" max={3} />
      </div>
    </div>
  );
};

export default TaskCard;
