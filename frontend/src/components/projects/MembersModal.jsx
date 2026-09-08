import { useState } from "react";
import { UserMinus, Crown, Shield } from "lucide-react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import Avatar from "../common/Avatar";
import * as projectService from "../../services/projectService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const MembersModal = ({ open, onClose, project, onUpdated }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const { user } = useAuth();

  const isOwner = project?.owner?._id === user?._id;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { project: updated } = await projectService.addMember(project._id, { email });
      onUpdated(updated);
      toast.success(`Invited ${email} to the project`);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    await projectService.removeMember(project._id, userId);
    toast.success("Member removed");
    onUpdated({ ...project, members: project.members.filter((m) => m.user._id !== userId) });
  };

  if (!project) return null;

  return (
    <Modal open={open} onClose={onClose} title="Team members">
      <div className="space-y-5">
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" loading={loading}>Invite</Button>
        </form>
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="space-y-2">
          {project.members?.map((m) => (
            <div key={m.user._id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ink-50">
              <div className="flex items-center gap-3">
                <Avatar name={m.user.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink-800 flex items-center gap-1.5">
                    {m.user.name}
                    {m.role === "owner" && <Crown size={13} className="text-flare-500" />}
                    {m.role === "admin" && <Shield size={13} className="text-nova-500" />}
                  </p>
                  <p className="text-xs text-ink-400">{m.user.email}</p>
                </div>
              </div>
              {isOwner && m.role !== "owner" && (
                <button
                  onClick={() => handleRemove(m.user._id)}
                  className="text-ink-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50"
                >
                  <UserMinus size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MembersModal;
