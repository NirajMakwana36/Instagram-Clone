const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error } = require("console");
const userModel = require("../models/user");
const { BaseCollection } = require("mongoose");
const upload = require("../middleware/multer");
const isLoggedIn = require("../middleware/auth");

router.get("/", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post(
  "/signup",
  body("username").trim().isLength({ min: 3 }),
  body("email").trim().isEmail().isLength({ min: 10 }),
  body("password").trim().isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!error) {
        return res.status(401).json({
          errors: errors.array(),
          message: "Invalid Data",
        });
      }
      const { username, email, password } = req.body;
      const user = await userModel.findOne({ email });
      if (user) {
        return res.json({
          message: "User Already Exists",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword,
      });
      // res.json(newUser);
      // res.json("User Signuped succefully!")
      res.redirect("/login");
    } catch (err) {
      console.error(err);
    }
  }
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  body("email").trim().isEmail().isLength({ min: 10 }),
  body("password").trim().isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!error) {
        return res.status(401).json({
          errors: errors.array(),
          message: "Invalid Data",
        });
      }
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.json({
          message: "User not found!",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({
          message: "User not found!",
        });
      }
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET
      );
      res.cookie("token", token);
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
    }
  }
);

router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user.userId).populate({
    path: "posts",
    populate: [
      { path: "user", select: "username pic" }, // populate post owner
      { path: "comments.user", select: "username pic" }, // populate comment owners
    ],
  });

  res.render("profile", {
    user,
    pic: user.pic,
    newPost: user.posts,
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

router.post(
  "/profile-pic",
  isLoggedIn,
  upload.single("pic"),
  async (req, res) => {
    const user = await userModel.findById(req.user.userId);
    user.pic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

module.exports = router;
