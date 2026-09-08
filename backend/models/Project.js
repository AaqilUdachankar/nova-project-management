import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 6,
    },
    color: {
      type: String,
      default: "#6366F1",
    },
    icon: {
      type: String,
      default: "folder",
    },
    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "completed", "archived"],
      default: "planning",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ "members.user": 1 });

// Virtual: check if a user is a member
projectSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

projectSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

const Project = mongoose.model("Project", projectSchema);
export default Project;
