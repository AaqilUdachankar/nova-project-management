import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Topbar from "../components/layout/Topbar";
import Avatar from "../components/common/Avatar";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import * as userService from "../services/userService";
import * as authService from "../services/authService";

const Profile = () => {
  const { user, updateUserLocal } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await userService.updateProfile(form);
      updateUserLocal(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await authService.updatePassword(passwordForm);
      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <Topbar title="Profile" subtitle="Manage your personal information and security" />
      <div className="px-8 pb-10 max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-ink-100/60 shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.name} size="lg" />
            <div>
              <h2 className="font-display font-semibold text-lg text-ink-900">{user?.name}</h2>
              <p className="text-sm text-ink-400">{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Bio"
              textarea
              rows={3}
              placeholder="Tell your team a bit about yourself"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Button type="submit" loading={savingProfile}>Save changes</Button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100/60 shadow-card p-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">Change password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Button type="submit" variant="secondary" loading={savingPassword}>Update password</Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
