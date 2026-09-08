export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const priorityStyles = {
  low: { label: "Low", dot: "bg-sky-400", text: "text-sky-600", bg: "bg-sky-50" },
  medium: { label: "Medium", dot: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50" },
  high: { label: "High", dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50" },
  urgent: { label: "Urgent", dot: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50" },
};

export const statusMeta = {
  todo: { label: "To Do", color: "#9A9AB8" },
  "in-progress": { label: "In Progress", color: "#5B54EC" },
  "in-review": { label: "In Review", color: "#F58B12" },
  done: { label: "Done", color: "#22C55E" },
};

export const avatarColors = [
  "#5B54EC", "#F58B12", "#22C55E", "#EC4899", "#0EA5E9", "#F43F5E", "#8B5CF6", "#F59E0B",
];

export const colorFromString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const isOverdue = (date, status) => {
  if (!date || status === "done") return false;
  return new Date(date) < new Date();
};
