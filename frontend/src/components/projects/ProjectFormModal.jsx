import { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

const colorOptions = ["#5B54EC", "#F58B12", "#EC4899", "#22C55E", "#0EA5E9", "#F43F5E", "#8B5CF6", "#14B8A6"];

const ProjectFormModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(
    initialData || { name: "", description: "", key: "", color: colorOptions[0], dueDate: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit project" : "New project"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-rose-50 text-rose-600 text-sm px-3.5 py-2.5 rounded-xl">{error}</div>}
        <Input
          label="Project name"
          placeholder="e.g. Nova Web Platform"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Description"
          textarea
          rows={3}
          placeholder="What is this project about?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Project key"
            placeholder="e.g. NOVA"
            maxLength={6}
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })}
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate ? String(form.dueDate).slice(0, 10) : ""}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-2">Color</label>
          <div className="flex gap-2">
            {colorOptions.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? "scale-110 ring-2 ring-offset-2 ring-ink-400" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
