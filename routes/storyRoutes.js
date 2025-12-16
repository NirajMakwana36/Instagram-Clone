const multer = require("multer");
const router = require("./postRoutes"); // folder for story images
const isLoggedIn = require("../middleware/auth");
const storyModel = require("../models/storyModel");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/stories");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/story", (req, res) => {
  res.render("storyUpload");
});

router.post(
  "/story",
  isLoggedIn,
  upload.single("storyImage"),
  async (req, res) => {
    try {
      const story = new storyModel({
        user: req.user.userId,
        image: req.file.filename,
        caption: req.body.caption || "",
      });
      await story.save();
      res.redirect("/home"); // redirect home after upload
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading story");
    }
  }
);

router.get("/stories", isLoggedIn, async (req, res) => {
  try {
    const stories = await storyModel
      .find({ expiresAt: { $gt: new Date() } }) // only unexpired
      .populate("user", "username pic")
      .sort({ createdAt: -1 })
      .lean();
    res.render("stories", { stories, currentUser: req.user });
  } catch (err) {
    console.error(err);
    res.send("Error loading stories");
  }
});

router.get("/story/:id", isLoggedIn, async (req, res) => {
  try {
    const story = await storyModel
      .findById(req.params.id)
      .populate("user", "username pic")
      .lean();
    if (!story) return res.status(404).send("Story not found");

    // Add current user to viewers if not already
    if (!story.viewers.includes(req.user.userId)) {
      story.viewers.push(req.user.userId);
      await story.save();
    }

    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
