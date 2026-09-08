import express from "express";
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTask,
  updateTask,
  reorderTasks,
  deleteTask,
  addComment,
  addSubtask,
  toggleSubtask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/projectAccess.js";

const router = express.Router();

router.use(protect);

router.get("/my-tasks", getMyTasks);
router.put("/reorder", reorderTasks);

router.route("/").post(requireProjectMember, createTask);

router.get("/project/:projectId", requireProjectMember, getProjectTasks);

router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

router.post("/:id/comments", addComment);
router.post("/:id/subtasks", addSubtask);
router.put("/:id/subtasks/:subtaskId", toggleSubtask);

export default router;
