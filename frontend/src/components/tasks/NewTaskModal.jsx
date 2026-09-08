import { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import Avatar from "../common/Avatar";

const NewTaskModal = ({ open, onClose, onSubmit, members, defaultStatus }) => {
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assignees: [] });
  const [loading, setLoading] = useState(false);

  const toggleAssignee = (userId) => {
    setForm((f) => ({
      ...f,
      assignees: f.assignees.includes(userId)
        ? f.assignees.filter((id) => id !== userId)
        : [...f.assignees, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ ...form, status: defaultStatus });
      setForm({ title: "", description: "", priority: "medium", assignees: [] });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
        <Input
          label="Description"
          textarea
          rows={3}
          placeholder="Add more details (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 text-sm bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">Assign to</label>
          <div className="flex flex-wrap gap-2">
            {members?.map((m) => (
              <button
                type="button"
                key={m.user._id}
                onClick={() => toggleAssignee(m.user._id)}
                className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-sm transition-colors ${
                  form.assignees.includes(m.user._id)
                    ? "border-nova-400 bg-nova-50 text-nova-700"
                    : "border-ink-100 text-ink-500"
                }`}
              >
                <Avatar name={m.user.name} size="xs" />
                {m.user.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;
