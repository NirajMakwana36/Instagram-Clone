const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const notificationController = require("../controllers/notificationControlles");

router.get("/notifications", isLoggedIn, notificationController.notifications);

router.post("/notifications/read/:id", isLoggedIn, notificationController.markAsRead);

module.exports = router;
