export const Badge = ({ children, color = "#5B54EC", className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
    style={{ backgroundColor: `${color}1A`, color }}
  >
    {children}
  </span>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {icon && <div className="mb-4 text-ink-300">{icon}</div>}
    <h3 className="font-display font-semibold text-lg text-ink-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-400 max-w-sm mb-5">{description}</p>}
    {action}
  </div>
);
