import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
