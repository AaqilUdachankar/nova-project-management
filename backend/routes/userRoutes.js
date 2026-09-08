import express from "express";
import {
  updateProfile,
  searchUsers,
  getUserById,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.put("/profile", updateProfile);
router.get("/search", searchUsers);
router.get("/:id", getUserById);

export default router;
