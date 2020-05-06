// Import dependencies
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Setup the app
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// Initialize users, rooms as empty
const users = {};
const rooms = {
  test: {},
  clubPenguin: {}
};

server.listen(3000)

app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.get("/:room", (req, res) => {
  res.render("room", { roomName: req.params.room });
});

io.on("connection", (socket) => {
  socket.emit("logger", "Hello, world!");

  socket.on("send-chat-message", (message) => {
    console.log(message);

    const context = {
      message: message,
      name: users[socket.id],
    };

    socket.broadcast.emit("chat-message", context);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });

  socket.on("new-user", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });
});
