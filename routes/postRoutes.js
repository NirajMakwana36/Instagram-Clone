const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const upload = require("../middleware/multer");
const postController = require("../controllers/postControlles");

router.get("/create", (req, res) => {
  res.render("create");
});

router.get("/upload", (req, res) => {
  res.render("upload");
});

router.post("/upload", isLoggedIn, upload.single("image"), postController.upload);

router.post("/like/:id", isLoggedIn, postController.like);

router.post("/comment/:id", isLoggedIn, postController.comment);

router.get("/home", isLoggedIn, postController.home);

// router.get("/home", isLoggedIn, async (req, res) => {
//     const posts = await postModel.find().populate("user").sort({createdAt: -1});
//     res.render("home", {posts});
// });

router.get("/post/:id", isLoggedIn, postController.seePost);

router.get("/delete/:id", postController.deletePost);

router.get("/explore", isLoggedIn, postController.explore);

module.exports = router;
