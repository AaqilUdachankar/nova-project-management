import { useEffect } from "react";
import { X } from "lucide-react";

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({ open, onClose, title, children, size = "md", footer }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-pop w-full ${sizeMap[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-display font-semibold text-lg text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-600 p-1 rounded-lg hover:bg-ink-50">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-ink-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
