const Reel = require("../models/reelModel");
const userModel = require("../models/user");

exports.reelUpload = async (req, res) => {
    try {
      const reel = new Reel({
        user: req.user.userId,
        video: req.file.path,
        caption: req.body.caption,
      });
      await reel.save();
      res.redirect("/reels");
    } catch (err) {
      res.status(500).send("Error creating reel");
    }
  }

exports.showReels = async (req, res) => {
  try {
    const reels = await Reel.find({})
      .populate("user", "username pic")
      .sort({ createdAt: -1 });

    const currentUser = await userModel
      .findById(req.user.userId)
      .populate("following", "_id username");

    res.render("reels/feed", { reels, currentUser });
  } catch (err) {
    console.error("Reels error:", err);
    res.status(500).send("Error loading reels");
  }
}