const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const uploadReel = require("../middleware/multerreel");
const reelController = require("../controllers/reelControlles");

router.get("/reels/upload", (req, res) => {
  res.render("reels/upload");
});

router.post(
  "/reels/upload",
  isLoggedIn,
  uploadReel.single("video"),
  reelController.reelUpload
);

router.get("/reels", isLoggedIn, reelController.showReels);


module.exports = router;
