const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const uploadReel = require("../middleware/multerreel");
const Reel = require("../models/reelModel");
const userModel = require("../models/user");

router.get("/reels/upload", (req, res) => {
  res.render("reels/upload");
});

// Create new reel
router.post(
  "/reels/upload",
  isLoggedIn,
  uploadReel.single("video"),
  async (req, res) => {
    try {
      const reel = new Reel({
        user: req.user.userId,
        video: req.file.filename,
        caption: req.body.caption,
      });
      await reel.save();
      res.redirect("/reels");
    } catch (err) {
      res.status(500).send("Error creating reel");
    }
  }
);

// Reels feed
router.get("/reels", isLoggedIn, async (req, res) => {
  try {
    const reels = await Reel.find({})
      .populate("user", "username pic")
      .sort({ createdAt: -1 });

    // ✅ Important: reload currentUser with following
    const currentUser = await userModel
      .findById(req.user.userId)
      .populate("following", "_id username");

    res.render("reels/feed", { reels, currentUser });
  } catch (err) {
    console.error("Reels error:", err);
    res.status(500).send("Error loading reels");
  }
});


module.exports = router;
