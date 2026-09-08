import api from "./api";

export const getProjects = (params) => api.get("/projects", { params }).then((r) => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then((r) => r.data);
export const createProject = (data) => api.post("/projects", data).then((r) => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then((r) => r.data);
export const getProjectAnalytics = (id) => api.get(`/projects/${id}/analytics`).then((r) => r.data);
export const addMember = (id, data) => api.post(`/projects/${id}/members`, data).then((r) => r.data);
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data);
export const updateMemberRole = (id, userId, role) =>
  api.put(`/projects/${id}/members/${userId}`, { role }).then((r) => r.data);
