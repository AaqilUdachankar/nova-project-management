import api from "./api";

export const register = (data) => api.post("/auth/register", data).then((r) => r.data);
export const login = (data) => api.post("/auth/login", data).then((r) => r.data);
export const logout = () => api.post("/auth/logout").then((r) => r.data);
export const getMe = () => api.get("/auth/me").then((r) => r.data);
export const updatePassword = (data) => api.put("/auth/password", data).then((r) => r.data);
