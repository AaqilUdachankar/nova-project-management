import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ title: "text", description: "text" });

// Pre-save hook: set completedAt when status changes to done
taskSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "done" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "done") {
      this.completedAt = undefined;
    }
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
