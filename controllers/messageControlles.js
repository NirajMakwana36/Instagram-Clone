const Message = require("../models/Message");
const userModel = require("../models/user");

exports.followingUsers = async (req, res) => {
  const currentUser = await userModel.findById(req.user.userId).populate("following");

  if (currentUser.following.length > 0) {
    const firstFollowingId = currentUser.following[0]._id;
    return res.redirect(`/messages/${firstFollowingId}`);
  }

  res.send("You are not following anyone yet!");
}

exports.chatBox = async (req, res) => {
  const currentUser = req.user.userId;
  const chatUser = await userModel.findById(req.params.id);
  const currentUserData = await userModel.findById(currentUser).populate("following");
  const following = currentUserData.following;

  const room = [currentUser, chatUser._id].sort().join("_");

  const messages = await Message.find({ room }).populate("sender").sort({ createdAt: 1 });
  console.log(messages);

  res.render("chat", { currentUser, chatUser, following, messages });
}