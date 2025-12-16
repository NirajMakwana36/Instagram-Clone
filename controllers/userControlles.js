const userModel = require("../models/user");
const postModel = require("../models/post");
const Reel = require("../models/reelModel");
const notificationModel = require("../models/Notification");

exports.profile = async (req, res) => {
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
}

exports.follow = async (req, res) => {
  try {
    const currentUser = await userModel.findById(req.user.userId);
    const targetUser = await userModel.findById(req.params.id);

    if (!currentUser || !targetUser) {
      return res.status(404).send("User not found");
    }

    if (!currentUser.following.includes(targetUser._id)) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      const notification = new notificationModel({
        receiver: targetUser._id,
        sender: currentUser._id,
        type: "follow",
        message: `${currentUser.username} started following you`,
      });
      await notification.save();
    } else {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
    }

    await currentUser.save();
    await targetUser.save();

    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).send("Server error");
  }
}

exports.like = async (req, res) => {
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
}

exports.posts = async (req, res) => {
  const user = await userModel.findById(req.user.userId).populate("user");
  res.render("allusers", { user });
}

exports.newProfile = async (req, res) => {
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
        populate: { path: "user", select: "username pic" }, 
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
}

exports.renderEditProfilePage = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  res.render("editprofile", {
    username: user.username,
    userId: user._id,
    bio: user.bio,
    website: user.website,
  });
}

exports.editProfile = async (req, res) => {
  const { username, bio, website } = req.body;
  await userModel.findByIdAndUpdate(req.params.id, { username, bio, website });
  res.redirect("/profile");
}

exports.search = async (req, res) => {
  const query = req.query.q || "";
  let users = [];

  if (query) {
    users = await userModel
      .find({ username: { $regex: query, $options: "i" } })
      .populate("followers") 
      .lean();
  }

  // current user
  const currentUser = await userModel.findById(req.user.userId).lean();

  res.render("search", {
    users,
    query,
    currentUser,
  });
}

exports.likedPosts = async (req, res) => {
  try {
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
}