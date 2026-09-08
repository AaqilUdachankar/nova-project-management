import { Loader2 } from "lucide-react";

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-ink-50">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-nova-500" size={32} />
      <p className="text-sm text-ink-400 font-display">Loading Nova...</p>
    </div>
  </div>
);

export default PageLoader;
