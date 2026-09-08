import api from "./api";

export const updateProfile = (data) => api.put("/users/profile", data).then((r) => r.data);
export const searchUsers = (q) => api.get("/users/search", { params: { q } }).then((r) => r.data);
export const getUserById = (id) => api.get(`/users/${id}`).then((r) => r.data);

export const getNotifications = () => api.get("/notifications").then((r) => r.data);
export const markAsRead = (id) => api.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllAsRead = () => api.put("/notifications/read-all").then((r) => r.data);
