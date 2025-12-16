const postModel = require("../models/post");
const userModel = require("../models/user");
const user = require("../models/user");
const Notification = require("../models/Notification");
const storyModel = require("../models/storyModel");

exports.upload = async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  const { caption } = req.body;
  const newPost = await postModel.create({
    image: req.file.path,
    user: user._id,
    caption,
  });
  user.posts.push(newPost._id);
  await user.save();
  res.redirect("/profile");
}

exports.like = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    const userId = req.user.userId;

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);

      if (post.user.toString() !== userId) {
        await Notification.create({
          type: "like",
          sender: userId,
          receiver: post.user,
          post: post._id,
          message: `${req.user.username} liked your post`,
        });
      }
    } else {
      post.likes.splice(post.likes.indexOf(userId), 1);

      await Notification.findOneAndDelete({
        type: "like",
        sender: userId,
        receiver: post.user,
        post: post._id,
      });
    }

    await post.save();
    res.redirect(req.get("referer"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

exports.comment = async (req, res) => {
  try {
    const post = await postModel
      .findById(req.params.id)
      .populate("user")
      .populate("comments.user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    post.comments.push({
      user: req.user.userId,
      text: req.body.comment, 
    });

    await post.save();

    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).send("Server error");
  }
}

exports.home = async (req, res) => {
  const user = await userModel.findById(req.user.userId).populate("following");
  const allUsers = await userModel.find();
  const followingIds = user.following.map((f) => f._id);
  const posts = await postModel
    .find({ user: { $in: followingIds } })
    .populate("user")
    .populate({
      path: "comments",
      populate: { path: "user", select: "username pic" }, 
    })
    .sort({ createdAt: -1 });
  const stories = await storyModel
    .find({ expiresAt: { $gt: new Date() } }) // only unexpired
    .populate("user", "username pic")
    .sort({ createdAt: -1 })
    .lean();
  res.render("home", { posts, allUsers, user, currentUser: user, stories  });
}

exports.seePost = async (req, res) => {
  const post = await postModel
    .findById(req.params.id)
    .populate("user")
    .populate("comments.user");
  res.render("post", { post });
}

exports.deletePost = async (req, res) => {
  await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/profile");
}

exports.explore = async (req, res) => {
  try {
    const newPost = await postModel
      .find({})
      .populate("user", "username pic") 
      .populate({
        path: "comments",
        populate: { path: "user", select: "username pic" }, 
      })
      .lean();

    res.render("explore", { newPost, currentUser: req.user });
  } catch (err) {
    console.error(err);
    res.send("Error loading explore page");
  }
}