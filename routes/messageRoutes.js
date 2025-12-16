const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const messageController = require("../controllers/messageControlles");

router.get("/", isLoggedIn, messageController.followingUsers);

router.get("/:id", isLoggedIn, messageController.chatBox);

module.exports = router;
