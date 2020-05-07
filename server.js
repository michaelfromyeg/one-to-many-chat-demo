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
  },
  lecture2: {
    users: {},
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
  };
  res.redirect(req.body.room);
  // Send message that new room was created
  io.emit("room-created", req.body.room);
});

io.on("connection", (socket) => {
  socket.emit("logger", "Hello, world!");

  socket.on("send-chat-message", (room, message) => {

    let role = rooms[room].users[socket.id].role;

    const context = {
      message: message,
      name: rooms[room].users[socket.id].name,
    };

    if (role === "Viewer") {
      let hostId = getHost(rooms[room]);
      io.to(hostId).emit("chat-message", context);
      // socket.to(room).broadcast.emit("chat-message", context);
    } else if (role === "Host") {
      socket.to(room).broadcast.emit("chat-message", context);
    }
  });

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket
        .to(room)
        .broadcast.emit("user-disconnected", rooms[room].users[socket.id].name);
      delete rooms[room].users[socket.id];
    });
  });

  socket.on("new-user", (room, name) => {
    socket.join(room);
    let context = {
      name: name,
      role: "user",
    };
    rooms[room].users[socket.id] = context;
    socket.to(room).broadcast.emit("user-connected", name);
  });

  socket.on("set-role", (room, context) => {
    if (context.role === "Viewer") {
      rooms[room].users[socket.id].role = context.role;
    } else if (context.role === "Host") {
      rooms[room].users[socket.id].role = context.role;
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

// Will only return the first host
function getHost(room) {
  let users = room.users;
  let entries = Object.entries(users);
  for (entry in entries) {
    if (entries[entry][1].role === "Host") {
      return entries[entry][0];
    }
  }
  throw new Error("No host in the room!");
}