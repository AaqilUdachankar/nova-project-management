import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("nova_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await authService.getMe();
      setUser(user);
    } catch {
      localStorage.removeItem("nova_token");
      localStorage.removeItem("nova_user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("nova_token", data.token);
    localStorage.setItem("nova_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem("nova_token", data.token);
    localStorage.setItem("nova_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("nova_token");
    localStorage.removeItem("nova_user");
    setUser(null);
  };

  const updateUserLocal = (partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUserLocal, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
