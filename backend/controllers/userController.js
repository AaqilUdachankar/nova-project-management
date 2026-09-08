import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({ success: true, user });
});

// @desc    Search users by name/email (for adding to projects)
// @route   GET /api/users/search?q=
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
    isActive: true,
  })
    .select("name email avatar")
    .limit(10);

  res.status(200).json({ success: true, users });
});

// @desc    Get user by id (basic public profile)
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name email avatar bio createdAt"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ success: true, user });
});
