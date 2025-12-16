const multer = require("multer");
const router = require("./postRoutes"); 
const isLoggedIn = require("../middleware/auth");
const storyController = require("../controllers/storyControlles");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "stories",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov"]
        : ["jpg", "jpeg", "png", "webp"],
    };
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
  storyController.uploadStory
);

router.get("/stories", isLoggedIn, storyController.showAllStories);

router.get("/story/:id", isLoggedIn, storyController.seeStory);

module.exports = router;
