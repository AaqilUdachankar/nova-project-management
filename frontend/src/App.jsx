import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import MyTasks from "./pages/MyTasks";
import Profile from "./pages/Profile";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
