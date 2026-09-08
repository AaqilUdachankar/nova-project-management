const Input = ({ label, error, className = "", textarea = false, ...props }) => {
  const Comp = textarea ? "textarea" : "input";
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-600 mb-1.5">{label}</label>
      )}
      <Comp
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-ink-800 placeholder:text-ink-300 bg-white transition-shadow focus:outline-none focus:ring-2 focus:ring-nova-200 focus:border-nova-400 ${
          error ? "border-rose-400" : "border-ink-100"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default Input;
