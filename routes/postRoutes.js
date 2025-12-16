const express = require("express");
const router = express.Router();
const postModel = require("../models/post");
const userModel = require("../models/user");
const isLoggedIn = require("../middleware/auth");
const upload = require("../middleware/multer");
const user = require("../models/user");
const Notification = require("../models/Notification");
const storyModel = require("../models/storyModel");

router.get("/create", (req, res) => {
  res.render("create");
});

router.get("/upload", (req, res) => {
  res.render("upload");
});

router.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  const { caption } = req.body;
  const newPost = await postModel.create({
    image: req.file.filename,
    user: user._id,
    caption,
  });
  user.posts.push(newPost._id);
  await user.save();
  res.redirect("/profile");
});

router.post("/like/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    const userId = req.user.userId;

    if (!post.likes.includes(userId)) {
      // Add like
      post.likes.push(userId);

      // Create notification if liker is not post owner
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
      // Remove like
      post.likes.splice(post.likes.indexOf(userId), 1);

      // Optional: Remove the notification when unliking
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
});

router.post("/comment/:id", isLoggedIn, async (req, res) => {
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
      text: req.body.comment, // use the name from your form input
    });

    await post.save();

    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).send("Server error");
  }
});

router.get("/home", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user.userId).populate("following");
  const allUsers = await userModel.find();
  const followingIds = user.following.map((f) => f._id);
  const posts = await postModel
    .find({ user: { $in: followingIds } })
    .populate("user")
    .populate({
      path: "comments",
      populate: { path: "user", select: "username pic" }, // populate comment user info
    })
    .sort({ createdAt: -1 });
  const stories = await storyModel
    .find({ expiresAt: { $gt: new Date() } }) // only unexpired
    .populate("user", "username pic")
    .sort({ createdAt: -1 })
    .lean();
  res.render("home", { posts, allUsers, user, currentUser: user, stories  });
});
// router.get("/home", isLoggedIn, async (req, res) => {
//     const posts = await postModel.find().populate("user").sort({createdAt: -1});
//     res.render("home", {posts});
// });

router.get("/post/:id", isLoggedIn, async (req, res) => {
  const post = await postModel
    .findById(req.params.id)
    .populate("user")
    .populate("comments.user");
  res.render("post", { post });
});

router.get("/delete/:id", async (req, res) => {
  await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/profile");
});

router.get("/explore", isLoggedIn, async (req, res) => {
  try {
    // fetch all posts with user info and comments
    const newPost = await postModel
      .find({})
      .populate("user", "username pic") // get username and profile pic
      .populate({
        path: "comments",
        populate: { path: "user", select: "username pic" }, // populate comment user info
      })
      .lean();

    res.render("explore", { newPost, currentUser: req.user });
  } catch (err) {
    console.error(err);
    res.send("Error loading explore page");
  }
});

module.exports = router;
