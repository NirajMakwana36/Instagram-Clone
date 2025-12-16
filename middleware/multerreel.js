const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/reels");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".mp4" && ext !== ".mov" && ext !== ".avi" && ext !== ".mkv") {
      return cb(new Error("Only video files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
