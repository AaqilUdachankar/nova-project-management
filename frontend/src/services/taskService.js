import api from "./api";

export const getProjectTasks = (projectId, params) =>
  api.get(`/tasks/project/${projectId}`, { params }).then((r) => r.data);
export const getMyTasks = () => api.get("/tasks/my-tasks").then((r) => r.data);
export const getTask = (id) => api.get(`/tasks/${id}`).then((r) => r.data);
export const createTask = (data) => api.post("/tasks", data).then((r) => r.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data);
export const reorderTasks = (tasks) => api.put("/tasks/reorder", { tasks }).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((r) => r.data);
export const addComment = (id, text) => api.post(`/tasks/${id}/comments`, { text }).then((r) => r.data);
export const addSubtask = (id, title) => api.post(`/tasks/${id}/subtasks`, { title }).then((r) => r.data);
export const toggleSubtask = (id, subtaskId) =>
  api.put(`/tasks/${id}/subtasks/${subtaskId}`).then((r) => r.data);
