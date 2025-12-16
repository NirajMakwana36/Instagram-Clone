const Notification = require("../models/Notification");
const userModel = require("../models/user");
const postModel = require("../models/post");

exports.notifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.userId })
      .populate("sender", "username pic")
      .populate("post", "image")
      .sort({ createdAt: -1 })
      .lean();

    res.render("notifications", { notifications });
  } catch (err) {
    console.error(err);
    res.send("Error loading notifications");
  }
}

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.redirect("/notifications");
  } catch (err) {
    console.error(err);
    res.send("Error marking as read");
  }
}