require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const reelRoutes = require("./routes/reelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const storyRotes = require("./routes/storyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const Message = require("./models/Message");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const onlineUsers = {};
const cookieParser = require("cookie-parser");
const path = require("path");
const connectToDb = require("./config/db");
connectToDb();

app.use(express.static(path.join(__dirname, "public/")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes);
app.use("/", reelRoutes);
app.use("/messages", messageRoutes);
app.use("/", notificationRoutes);
app.use("/", storyRotes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  // Handle sending messages
  socket.on("chatMessage", async (msg) => {
    const Message = require("./models/Message");
    const newMsg = await Message.create(msg);
    io.to(msg.room).emit("chatMessage", {
      text: newMsg.text,
      sender: newMsg.sender.toString(),
    });
  });

  // Typing
  socket.on("typing", ({ room, sender }) => {
    socket.to(room).emit("typing", sender);
  });

  socket.on("stopTyping", (room) => {
    socket.to(room).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
http.listen(3000, () => console.log(`Server running on ${3000}`));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
