import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";

// Verify the logged-in user belongs to the project referenced by :projectId or req.body.project
export const requireProjectMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project;

  if (!projectId) {
    res.status(400);
    throw new Error("Project id is required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isMember = project.isMember(req.user._id);

  if (!isOwner && !isMember) {
    res.status(403);
    throw new Error("You do not have access to this project");
  }

  req.project = project;
  next();
});

// Verify the logged-in user is owner/admin of the project
export const requireProjectAdmin = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project;
  const project = req.project || (await Project.findById(projectId));

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const role = project.getMemberRole(req.user._id);

  if (!isOwner && role !== "admin") {
    res.status(403);
    throw new Error("Only project owners/admins can perform this action");
  }

  req.project = project;
  next();
});
