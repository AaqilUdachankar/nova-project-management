import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, key, color, dueDate } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const projectKey =
    key?.trim().toUpperCase() ||
    name
      .replace(/[^a-zA-Z ]/g, "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();

  const project = await Project.create({
    name,
    description,
    key: projectKey,
    color,
    dueDate,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner" }],
  });

  const populated = await project.populate("members.user", "name email avatar");

  res.status(201).json({ success: true, project: populated });
});

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {
    $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    isArchived: false,
  };

  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };

  const projects = await Project.find(filter)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ updatedAt: -1 });

  // Attach task stats for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id, isArchived: false });
      const total = tasks.length;
      const done = tasks.filter((t) => t.status === "done").length;
      return {
        ...project.toObject(),
        stats: {
          totalTasks: total,
          completedTasks: done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
        },
      };
    })
  );

  res.status(200).json({ success: true, count: projectsWithStats.length, projects: projectsWithStats });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar bio");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const tasks = await Task.find({ project: project._id, isArchived: false });
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;

  res.status(200).json({
    success: true,
    project: {
      ...project.toObject(),
      stats: {
        totalTasks: total,
        completedTasks: done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      },
    },
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin/owner)
export const updateProject = asyncHandler(async (req, res) => {
  const project = req.project;
  const { name, description, color, status, dueDate, icon } = req.body;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (color) project.color = color;
  if (status) project.status = status;
  if (dueDate !== undefined) project.dueDate = dueDate;
  if (icon) project.icon = icon;

  await project.save();
  const populated = await project.populate("members.user", "name email avatar");

  res.status(200).json({ success: true, project: populated });
});

// @desc    Delete (archive) project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
export const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project;

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the project owner can delete this project");
  }

  project.isArchived = true;
  await project.save();

  res.status(200).json({ success: true, message: "Project archived successfully" });
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (admin/owner)
export const addMember = asyncHandler(async (req, res) => {
  const project = req.project;
  const { email, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  if (project.isMember(user._id)) {
    res.status(400);
    throw new Error("User is already a member of this project");
  }

  project.members.push({ user: user._id, role: role || "member" });
  await project.save();

  await Notification.create({
    recipient: user._id,
    sender: req.user._id,
    type: "project-invite",
    message: `${req.user.name} added you to the project "${project.name}"`,
    project: project._id,
  });

  const populated = await project.populate("members.user", "name email avatar");
  res.status(200).json({ success: true, project: populated });
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (admin/owner)
export const removeMember = asyncHandler(async (req, res) => {
  const project = req.project;
  const { userId } = req.params;

  if (userId === project.owner.toString()) {
    res.status(400);
    throw new Error("Cannot remove the project owner");
  }

  project.members = project.members.filter(
    (m) => m.user.toString() !== userId
  );
  await project.save();

  res.status(200).json({ success: true, message: "Member removed successfully" });
});

// @desc    Update a member's role
// @route   PUT /api/projects/:id/members/:userId
// @access  Private (owner only)
export const updateMemberRole = asyncHandler(async (req, res) => {
  const project = req.project;
  const { userId } = req.params;
  const { role } = req.body;

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the owner can change member roles");
  }

  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) {
    res.status(404);
    throw new Error("Member not found in this project");
  }

  member.role = role;
  await project.save();

  res.status(200).json({ success: true, message: "Member role updated" });
});

// @desc    Get project analytics/stats
// @route   GET /api/projects/:id/analytics
// @access  Private
export const getProjectAnalytics = asyncHandler(async (req, res) => {
  const project = req.project;
  const tasks = await Task.find({ project: project._id, isArchived: false });

  const statusCounts = {
    todo: 0,
    "in-progress": 0,
    "in-review": 0,
    done: 0,
  };
  const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
  const memberWorkload = {};

  tasks.forEach((task) => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    task.assignees.forEach((a) => {
      const key = a.toString();
      memberWorkload[key] = (memberWorkload[key] || 0) + 1;
    });
  });

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  res.status(200).json({
    success: true,
    analytics: {
      totalTasks: tasks.length,
      statusCounts,
      priorityCounts,
      memberWorkload,
      overdueTasks,
      completionRate:
        tasks.length > 0
          ? Math.round((statusCounts.done / tasks.length) * 100)
          : 0,
    },
  });
});
