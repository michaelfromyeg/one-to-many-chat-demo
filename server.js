// Import dependencies
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Setup the app
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

// Initialize rooms as empty
// Each room consits of some users, some hosts, and some viewers
// Users can't see any messages until they choose a role, hosts see all messages, and viewers only see messages between themselves and the host
const rooms = {
  lecture1: { 
    users: {},
    hosts: {},
    viewers: {},
  },
  lecture2: { 
    users: {},
    hosts: {},
    viewers: {},
  },
};

server.listen(3000);

app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName: req.params.room });
});

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  rooms[req.body.room] = { 
    users: {},
    hosts: {},
    viewers: {}
  };
  res.redirect(req.body.room);
  // Send message that new room was created
  io.emit("room-created", req.body.room);
});

io.on("connection", (socket) => {
  socket.emit("logger", "Hello, world!");

  socket.on("send-chat-message", (room, message) => {
    console.log(message);

    const context = {
      message: message,
      name: rooms[room].users[socket.id],
    };

    socket.to(room).broadcast.emit("chat-message", context);
  });

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket
        .to(room)
        .broadcast.emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });

  socket.on("new-user", (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).broadcast.emit("user-connected", name);
  });

  socket.on("set-role", (room, context) => {
    if (context.role === "Viewer") {
      console.log("Add a viewer");
    } else if (context.role === "Host") {
      console.log("Add a host");
    } else {
      throw new Error("Invalid role provided to set-role socket listener");
    }
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}
