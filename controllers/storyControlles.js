const storyModel = require("../models/storyModel");

exports.uploadStory = async (req, res) => {
    try {
      const story = new storyModel({
        user: req.user.userId,
        image: req.file.path,
        caption: req.body.caption || "",
      });
      await story.save();
      res.redirect("/home");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading story");
    }
  }

  exports.showAllStories = async (req, res) => {
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
}

exports.seeStory = async (req, res) => {
  try {
    const story = await storyModel
      .findById(req.params.id)
      .populate("user", "username pic")
      .lean();
    if (!story) return res.status(404).send("Story not found");

    if (!story.viewers.includes(req.user.userId)) {
      story.viewers.push(req.user.userId);
      await story.save();
    }

    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}