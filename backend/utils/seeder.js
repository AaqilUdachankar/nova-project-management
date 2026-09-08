import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

dotenv.config();
await connectDB();

const seed = async () => {
  try {
    console.log("Clearing existing data...");
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Notification.deleteMany();

    console.log("Creating users...");
    const users = await User.create([
      { name: "Ava Patel", email: "ava@nova.io", password: "password123", role: "admin", bio: "Product lead" },
      { name: "Liam Chen", email: "liam@nova.io", password: "password123", bio: "Frontend engineer" },
      { name: "Maya Rodriguez", email: "maya@nova.io", password: "password123", bio: "Backend engineer" },
      { name: "Noah Kim", email: "noah@nova.io", password: "password123", bio: "UI/UX designer" },
    ]);

    const [ava, liam, maya, noah] = users;

    console.log("Creating projects...");
    const project1 = await Project.create({
      name: "Nova Web Platform",
      description: "Build and launch the core Nova team productivity web application.",
      key: "NOVA",
      color: "#6366F1",
      status: "active",
      owner: ava._id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      members: [
        { user: ava._id, role: "owner" },
        { user: liam._id, role: "member" },
        { user: maya._id, role: "member" },
        { user: noah._id, role: "admin" },
      ],
    });

    const project2 = await Project.create({
      name: "Mobile App Redesign",
      description: "Redesign the mobile experience with a new visual language.",
      key: "MOB",
      color: "#EC4899",
      status: "planning",
      owner: noah._id,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      members: [
        { user: noah._id, role: "owner" },
        { user: ava._id, role: "member" },
      ],
    });

    console.log("Creating tasks...");
    const taskSeed = [
      { title: "Design database schema", status: "done", priority: "high", assignees: [maya._id], project: project1._id },
      { title: "Set up Express API boilerplate", status: "done", priority: "high", assignees: [maya._id], project: project1._id },
      { title: "Build authentication flow", status: "in-progress", priority: "urgent", assignees: [maya._id, liam._id], project: project1._id },
      { title: "Design Kanban board UI", status: "in-progress", priority: "high", assignees: [noah._id], project: project1._id },
      { title: "Implement drag-and-drop tasks", status: "todo", priority: "medium", assignees: [liam._id], project: project1._id },
      { title: "Set up CI/CD pipeline", status: "todo", priority: "low", assignees: [maya._id], project: project1._id },
      { title: "Write onboarding docs", status: "in-review", priority: "medium", assignees: [ava._id], project: project1._id },
      { title: "User research interviews", status: "done", priority: "medium", assignees: [noah._id], project: project2._id },
      { title: "Create wireframes", status: "in-progress", priority: "high", assignees: [noah._id], project: project2._id },
      { title: "Stakeholder review", status: "todo", priority: "medium", assignees: [ava._id], project: project2._id },
    ];

    for (let i = 0; i < taskSeed.length; i++) {
      await Task.create({
        ...taskSeed[i],
        order: i,
        createdBy: ava._id,
        description: "Auto-generated seed task for demonstration purposes.",
        dueDate: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
      });
    }

    console.log("Seed data created successfully!");
    console.log("\nDemo login credentials:");
    users.forEach((u) => console.log(`  ${u.email} / password123`));
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
