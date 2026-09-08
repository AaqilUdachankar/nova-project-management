import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  getProjectAnalytics,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/projectAccess.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createProject).get(getProjects);

router
  .route("/:id")
  .get(requireProjectMember, getProject)
  .put(requireProjectAdmin, updateProject)
  .delete(requireProjectMember, deleteProject);

router.get("/:id/analytics", requireProjectMember, getProjectAnalytics);

router.post("/:id/members", requireProjectAdmin, addMember);
router.delete("/:id/members/:userId", requireProjectAdmin, removeMember);
router.put("/:id/members/:userId", requireProjectMember, updateMemberRole);

export default router;
