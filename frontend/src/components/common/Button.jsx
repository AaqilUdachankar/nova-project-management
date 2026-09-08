import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-nova-500 text-white hover:bg-nova-600 shadow-card",
  secondary: "bg-white text-ink-700 border border-ink-100 hover:bg-ink-50",
  ghost: "bg-transparent text-ink-500 hover:bg-ink-50",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  flare: "bg-flare-500 text-white hover:bg-flare-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default Button;
