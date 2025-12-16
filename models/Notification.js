const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'like', 'comment', 'follow', 'message'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post" }, // optional
  message: { type: String }, // optional custom message
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
