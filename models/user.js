const mongoose = require("mongoose");
const { type } = require("os");

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    bio: {
        type: String
    },
    password: {
        type: String
    },
    pic: {
        type: String,
        default: "default.webp"
    },
    website: {
        type: String
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    reels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reel"
        }
    ]
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);