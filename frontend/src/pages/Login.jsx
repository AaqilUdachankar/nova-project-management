import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email || !form.password) {
      setErrors({ form: "Please fill in both fields" });
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-nova-glow px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nova-500 flex items-center justify-center mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome to Nova</h1>
          <p className="text-ink-300 text-sm mt-1">Plan. Collaborate. Deliver.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-pop p-7 space-y-4">
          {errors.form && (
            <div className="bg-rose-50 text-rose-600 text-sm px-3.5 py-2.5 rounded-xl">
              {errors.form}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign in
          </Button>
          <p className="text-center text-sm text-ink-400 pt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-nova-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-ink-500 mt-6">
          Demo: ava@nova.io / password123
        </p>
      </div>
    </div>
  );
};

export default Login;
