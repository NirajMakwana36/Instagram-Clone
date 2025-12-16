const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const userModel = require("../models/user");
const isLoggedIn = require("../middleware/auth")


// Redirect /messages to first following user's chat (optional)
router.get("/", isLoggedIn, async (req, res) => {
  const currentUser = await userModel.findById(req.user.userId).populate("following");

  // If user has following, redirect to the first one's chat
  if (currentUser.following.length > 0) {
    const firstFollowingId = currentUser.following[0]._id;
    return res.redirect(`/messages/${firstFollowingId}`);
  }

  // If no following, just show a placeholder or empty chat
  res.send("You are not following anyone yet!");
});

// Get chat page directly
router.get("/:id", isLoggedIn, async (req, res) => {
  const currentUser = req.user.userId;
  const chatUser = await userModel.findById(req.params.id);

  // Use following of current user for sidebar (optional)
  const currentUserData = await userModel.findById(currentUser).populate("following");
  const following = currentUserData.following;

  // Unique room for these two users
  const room = [currentUser, chatUser._id].sort().join("_");

  // Get previous messages
  const messages = await Message.find({ room }).populate("sender").sort({ createdAt: 1 });
  console.log(messages);

  // Render chat page directly
  res.render("chat", { currentUser, chatUser, following, messages });
});

module.exports = router;
