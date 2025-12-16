const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const postModel = require("../models/post");
const isLoggedIn = require("../middleware/auth");
const user = require("../models/user");
const { get } = require("mongoose");
const Reel = require("../models/reelModel");
const notificationModel = require("../models/Notification");

router.get("/profile", isLoggedIn, async (req, res) => {
  const currentUser = await userModel.findById(req.user.userId);
  const posts = await postModel
    .find({ user: currentUser._id })
    .populate("user")
    .populate("likes")
    .sort({ createdAt: -1 });

  const followersData = await userModel.find({
    _id: { $in: currentUser.followers },
  });
  const followingData = await userModel.find({
    _id: { $in: currentUser.following },
  });

  const reels = await Reel.find({ user: currentUser._id });
  res.render("profile", {
    posts,
    user: currentUser,
    reels,
    followersData,
    followingData,
  });
});

router.post("/follow/:id", isLoggedIn, async (req, res) => {
  try {
    const currentUser = await userModel.findById(req.user.userId);
    const targetUser = await userModel.findById(req.params.id);

    if (!currentUser || !targetUser) {
      return res.status(404).send("User not found");
    }

    if (!currentUser.following.includes(targetUser._id)) {
      // ✅ Add follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      // ✅ Create notification only on follow
      const notification = new notificationModel({
        receiver: targetUser._id,
        sender: currentUser._id,
        type: "follow",
        message: `${currentUser.username} started following you`,
      });
      await notification.save();
    } else {
      // ✅ Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
    }

    await currentUser.save();
    await targetUser.save();

    // ✅ Redirect back to where request came from
    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).send("Server error");
  }
});

router.post("/like/:id", isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.id);
  if (!post.likes.includes(req.user._id)) {
    post.likes.push(req.user._id);
  } else {
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  }
  await post.save();
  res.redirect("/feed");
});

router.get("/posts", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user.userId).populate("user");
  res.render("allusers", { user });
});

router.get("/newprofile/:id", isLoggedIn, async (req, res) => {
  try {
    const profileUser = await userModel
      .findById(req.params.id)
      .populate("followers")
      .populate("following");

    const currentUser = await userModel.findById(req.user.userId);

    if (!profileUser || !currentUser) {
      return res.status(404).send("User not found");
    }

    const posts = await postModel
      .find({ user: req.params.id })
      .populate("user")
      .populate("likes")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username pic" }, // populate comment user info
      })
      .sort({ createdAt: -1 });

    const reels = await Reel.find({ user: req.params.id });

    const followersData = await userModel.find({
      _id: { $in: profileUser.followers },
    });
    const followingData = await userModel.find({
      _id: { $in: profileUser.following },
    });

    res.render("newprofile", {
      posts,
      user: profileUser,
      currentUser,
      followersData,
      followingData,
      reels,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).send("Server error");
  }
});

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.params.id);
  res.render("editprofile", {
    username: user.username,
    userId: user._id,
    bio: user.bio,
    website: user.website,
  });
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
  const { username, bio, website } = req.body;
  await userModel.findByIdAndUpdate(req.params.id, { username, bio, website });
  res.redirect("/profile");
});

router.get("/search", isLoggedIn, async (req, res) => {
  const query = req.query.q || "";
  let users = [];

  if (query) {
    users = await userModel
      .find({ username: { $regex: query, $options: "i" } })
      .populate("followers") // populate followers to get _id
      .lean();
  }

  // current user
  const currentUser = await userModel.findById(req.user.userId).lean();

  res.render("search", {
    users,
    query,
    currentUser,
  });
});

// POST search request
router.post("/search", isLoggedIn, async (req, res) => {
  const query = req.body.query || "";
  // search by username (case-insensitive)
  const users = await userModel.find({
    username: { $regex: query, $options: "i" },
  });

  res.render("search", { users, query });
});

router.get("/liked", isLoggedIn, async (req, res) => {
  try {
    // Find all posts where current user has liked
    const likedPosts = await postModel
      .find({ likes: req.user.userId })
      .populate("user") // populate user info for profile pic & username
      .populate("comments.user") // populate comments user
      .lean();

    res.render("liked", {
      likedPosts,
      currentUser: req.user,
    });
  } catch (err) {
    console.error(err);
    res.send("Something went wrong");
  }
});

module.exports = router;
