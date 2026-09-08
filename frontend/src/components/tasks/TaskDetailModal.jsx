import { useState } from "react";
import { Trash2, Plus, Send, Check } from "lucide-react";
import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import Input from "../common/Input";
import { priorityStyles, statusMeta, formatDate } from "../../utils/helpers";
import * as taskService from "../../services/taskService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const TaskDetailModal = ({ open, onClose, task, members, onUpdated, onDeleted }) => {
  const [comment, setComment] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  if (!task) return null;

  const handleField = async (field, value) => {
    setSaving(true);
    try {
      const { task: updated } = await taskService.updateTask(task._id, { [field]: value });
      onUpdated(updated);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignee = async (userId) => {
    const current = task.assignees.map((a) => a._id);
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    await handleField("assignees", next);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { comments } = await taskService.addComment(task._id, comment);
      onUpdated({ ...task, comments });
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    const { subtasks } = await taskService.addSubtask(task._id, subtaskTitle);
    onUpdated({ ...task, subtasks });
    setSubtaskTitle("");
  };

  const handleToggleSubtask = async (subtaskId) => {
    const { subtasks } = await taskService.toggleSubtask(task._id, subtaskId);
    onUpdated({ ...task, subtasks });
  };

  const handleDelete = async () => {
    await taskService.deleteTask(task._id);
    toast.success("Task deleted");
    onDeleted(task._id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Task details" size="lg">
      <div className="space-y-5">
        <Input
          value={task.title}
          onChange={(e) => onUpdated({ ...task, title: e.target.value })}
          onBlur={(e) => handleField("title", e.target.value)}
          className="!text-lg !font-display !font-semibold !border-transparent !px-0 focus:!border-nova-400 focus:!px-3.5"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">Status</label>
            <select
              value={task.status}
              onChange={(e) => handleField("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 text-sm bg-white"
            >
              {Object.keys(statusMeta).map((s) => (
                <option key={s} value={s}>{statusMeta[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">Priority</label>
            <select
              value={task.priority}
              onChange={(e) => handleField("priority", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 text-sm bg-white"
            >
              {Object.keys(priorityStyles).map((p) => (
                <option key={p} value={p}>{priorityStyles[p].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">Due date</label>
            <input
              type="date"
              value={task.dueDate ? String(task.dueDate).slice(0, 10) : ""}
              onChange={(e) => handleField("dueDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1.5">Assignees</label>
          <div className="flex flex-wrap gap-2">
            {members?.map((m) => {
              const assigned = task.assignees?.some((a) => a._id === m.user._id);
              return (
                <button
                  key={m.user._id}
                  onClick={() => toggleAssignee(m.user._id)}
                  className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-sm transition-colors ${
                    assigned ? "border-nova-400 bg-nova-50 text-nova-700" : "border-ink-100 text-ink-500"
                  }`}
                >
                  <Avatar name={m.user.name} size="xs" />
                  {m.user.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1.5">Description</label>
          <Input
            textarea
            rows={3}
            placeholder="Add a description..."
            value={task.description || ""}
            onChange={(e) => onUpdated({ ...task, description: e.target.value })}
            onBlur={(e) => handleField("description", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-2">
            Subtasks {task.subtasks?.length > 0 && `(${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length})`}
          </label>
          <div className="space-y-1.5 mb-2">
            {task.subtasks?.map((s) => (
              <button
                key={s._id}
                onClick={() => handleToggleSubtask(s._id)}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg hover:bg-ink-50"
              >
                <span className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center ${s.completed ? "bg-nova-500 border-nova-500" : "border-ink-200"}`}>
                  {s.completed && <Check size={11} className="text-white" />}
                </span>
                <span className={`text-sm ${s.completed ? "text-ink-300 line-through" : "text-ink-700"}`}>
                  {s.title}
                </span>
              </button>
            ))}
          </div>
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              placeholder="Add a subtask..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-ink-100 text-sm focus:outline-none focus:ring-2 focus:ring-nova-200"
            />
            <button type="submit" className="text-nova-500 hover:text-nova-600 p-1.5">
              <Plus size={16} />
            </button>
          </form>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-2">
            Comments ({task.comments?.length || 0})
          </label>
          <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
            {task.comments?.map((c) => (
              <div key={c._id} className="flex gap-2.5">
                <Avatar name={c.user?.name || "User"} size="xs" />
                <div className="flex-1 bg-ink-50 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-700">{c.user?.name}</span>
                    <span className="text-[10px] text-ink-300">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink-600 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <Avatar name={user?.name} size="xs" />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-ink-100 text-sm focus:outline-none focus:ring-2 focus:ring-nova-200"
            />
            <button type="submit" className="text-nova-500 hover:text-nova-600 p-1.5">
              <Send size={16} />
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-ink-100">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600"
          >
            <Trash2 size={14} /> Delete task
          </button>
          {saving && <span className="text-xs text-ink-300">Saving...</span>}
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
