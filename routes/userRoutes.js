const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const { get } = require("mongoose");
const userController = require("../controllers/userControlles");

router.get("/profile", isLoggedIn, userController.profile);

router.post("/follow/:id", isLoggedIn, userController.follow);

router.post("/like/:id", isLoggedIn, userController.like);

router.get("/posts", isLoggedIn, userController.posts);

router.get("/newprofile/:id", isLoggedIn, userController.newProfile);

router.get("/edit/:id", isLoggedIn, userController.renderEditProfilePage);

router.post("/edit/:id", isLoggedIn, userController.editProfile);

router.get("/search", isLoggedIn, userController.search);

router.get("/liked", isLoggedIn, userController.likedPosts);

module.exports = router;
