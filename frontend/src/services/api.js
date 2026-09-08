import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nova_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling - log the user out client-side
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nova_token");
      localStorage.removeItem("nova_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
