const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  image: { type: String, required: true },
  caption: { type: String },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 24*60*60*1000) } // 24 hours
});

module.exports = mongoose.model("story", storySchema);
