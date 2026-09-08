import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";

// @desc    Create task within a project
// @route   POST /api/tasks
// @access  Private (project member)
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, priority, assignees, dueDate, labels, status } = req.body;

  if (!title || !project) {
    res.status(400);
    throw new Error("Title and project are required");
  }

  const lastTask = await Task.findOne({ project }).sort({ order: -1 });
  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    title,
    description,
    project,
    priority,
    assignees,
    dueDate,
    labels,
    status,
    order,
    createdBy: req.user._id,
  });

  if (assignees && assignees.length > 0) {
    await Promise.all(
      assignees
        .filter((a) => a.toString() !== req.user._id.toString())
        .map((assigneeId) =>
          Notification.create({
            recipient: assigneeId,
            sender: req.user._id,
            type: "task-assigned",
            message: `${req.user.name} assigned you a task: "${task.title}"`,
            project,
            task: task._id,
          })
        )
    );
  }

  const populated = await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);

  res.status(201).json({ success: true, task: populated });
});

// @desc    Get all tasks for a project (supports filters)
// @route   GET /api/tasks/project/:projectId
// @access  Private (project member)
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignee, search } = req.query;

  const filter = { project: req.params.projectId, isArchived: false };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignees = assignee;
  if (search) filter.$text = { $search: search };

  const tasks = await Task.find(filter)
    .populate("assignees", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("comments.user", "name email avatar")
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({ success: true, count: tasks.length, tasks });
});

// @desc    Get tasks assigned to the logged-in user (across all projects)
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    assignees: req.user._id,
    isArchived: false,
  })
    .populate("project", "name key color")
    .populate("assignees", "name email avatar")
    .sort({ dueDate: 1, createdAt: -1 });

  res.status(200).json({ success: true, count: tasks.length, tasks });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private (project member)
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignees", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("comments.user", "name email avatar");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.status(200).json({ success: true, task });
});

// @desc    Update task (fields, status - used for kanban drag/drop too)
// @route   PUT /api/tasks/:id
// @access  Private (project member)
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await Project.findById(task.project);
  const isAuthorized =
    project.owner.toString() === req.user._id.toString() ||
    project.isMember(req.user._id);

  if (!isAuthorized) {
    res.status(403);
    throw new Error("You do not have access to this task");
  }

  const {
    title,
    description,
    status,
    priority,
    assignees,
    dueDate,
    labels,
    order,
  } = req.body;

  const previousAssignees = task.assignees.map((a) => a.toString());

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (assignees !== undefined) task.assignees = assignees;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (labels !== undefined) task.labels = labels;
  if (order !== undefined) task.order = order;

  await task.save();

  // Notify newly added assignees
  if (assignees) {
    const newAssignees = assignees.filter(
      (a) => !previousAssignees.includes(a.toString()) && a.toString() !== req.user._id.toString()
    );
    await Promise.all(
      newAssignees.map((assigneeId) =>
        Notification.create({
          recipient: assigneeId,
          sender: req.user._id,
          type: "task-assigned",
          message: `${req.user.name} assigned you a task: "${task.title}"`,
          project: task.project,
          task: task._id,
        })
      )
    );
  }

  const populated = await task.populate([
    { path: "assignees", select: "name email avatar" },
    { path: "createdBy", select: "name email avatar" },
  ]);

  res.status(200).json({ success: true, task: populated });
});

// @desc    Reorder / move tasks (bulk update for kanban drag-and-drop)
// @route   PUT /api/tasks/reorder
// @access  Private (project member)
export const reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body; // [{ id, status, order }]

  if (!Array.isArray(tasks)) {
    res.status(400);
    throw new Error("Tasks must be an array");
  }

  await Promise.all(
    tasks.map((t) =>
      Task.findByIdAndUpdate(t.id, { status: t.status, order: t.order })
    )
  );

  res.status(200).json({ success: true, message: "Tasks reordered successfully" });
});

// @desc    Delete task (archive)
// @route   DELETE /api/tasks/:id
// @access  Private (project member)
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.isArchived = true;
  await task.save();

  res.status(200).json({ success: true, message: "Task deleted successfully" });
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private (project member)
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.comments.push({ user: req.user._id, text });
  await task.save();

  const notifyIds = task.assignees.filter(
    (a) => a.toString() !== req.user._id.toString()
  );
  await Promise.all(
    notifyIds.map((id) =>
      Notification.create({
        recipient: id,
        sender: req.user._id,
        type: "task-comment",
        message: `${req.user.name} commented on "${task.title}"`,
        project: task.project,
        task: task._id,
      })
    )
  );

  const populated = await task.populate("comments.user", "name email avatar");
  res.status(201).json({ success: true, comments: populated.comments });
});

// @desc    Add / toggle subtask
// @route   POST /api/tasks/:id/subtasks
// @access  Private (project member)
export const addSubtask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.subtasks.push({ title });
  await task.save();

  res.status(201).json({ success: true, subtasks: task.subtasks });
});

// @desc    Toggle subtask completion
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @access  Private (project member)
export const toggleSubtask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const subtask = task.subtasks.id(req.params.subtaskId);
  if (!subtask) {
    res.status(404);
    throw new Error("Subtask not found");
  }

  subtask.completed = !subtask.completed;
  await task.save();

  res.status(200).json({ success: true, subtasks: task.subtasks });
});
