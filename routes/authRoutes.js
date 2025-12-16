const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const isLoggedIn = require("../middleware/auth");
const authController = require("../controllers/authControlles");

router.get("/", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", authController.signUp);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", authController.login);


router.get("/profile", isLoggedIn, authController.profile);

router.get("/logout", authController.logout);

router.post(
  "/profile-pic",
  isLoggedIn,
  upload.single("pic"),
  authController.profilePic
);

module.exports = router;
