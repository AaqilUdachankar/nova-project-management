import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.name || !form.email || !form.password) {
      setErrors({ form: "Please fill in all fields" });
      return;
    }
    if (form.password.length < 6) {
      setErrors({ form: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created — welcome to Nova!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
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
          <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
          <p className="text-ink-300 text-sm mt-1">Start planning with your team today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-pop p-7 space-y-4">
          {errors.form && (
            <div className="bg-rose-50 text-rose-600 text-sm px-3.5 py-2.5 rounded-xl">
              {errors.form}
            </div>
          )}
          <Input
            label="Full name"
            placeholder="Ava Patel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create account
          </Button>
          <p className="text-center text-sm text-ink-400 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-nova-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
