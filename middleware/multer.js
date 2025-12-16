const multer = require("multer");
const { db } = require("../models/user");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    } 
});

const upload = multer({storage});

module.exports = upload;