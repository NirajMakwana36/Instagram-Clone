const mongoose = require("mongoose");
const { type } = require("os");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  caption: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  image: {
    type: String,
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  saves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = mongoose.model("post", postSchema);
