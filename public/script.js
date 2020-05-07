const socket = io("http://localhost:3000");

//TODO: Separate into lobby code and room code, if it gets too long

// For room
const sendContainer = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const roleLabel = document.getElementById("role");

const buttonHost = document.getElementById("add-host");
const buttonViewer = document.getElementById("add-viewer");

// For lobby
const roomContainer = document.getElementById("room-container");

if (sendContainer != null) {
  // const name = prompt("What is your name?");
  const name = "Testing";
  appendMessage("You joined");
  socket.emit("new-user", roomName, name);

  sendContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
  });
}

socket.on("chat-message", (data) => {
  console.log("data", data);
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  console.log("name", name);
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  console.log("name", name);
  appendMessage(`${name} disconnected`);
});

socket.on("logger", (data) => {
  console.log(data);
});

socket.on("room-created", (room) => {
  /*
  <div>
      <%= room %>&nbsp;&nbsp;<a href="/<%= room %>">Join</a>
  </div>
  */
  const roomElement = document.createElement("div");
  roomElement.innerText = `${room} `;

  const linkElement = document.createElement("a");
  linkElement.href = `/${room}`;
  linkElement.innerText = `Join`;

  roomElement.append(linkElement);
  roomContainer.append(roomElement);
});

function appendMessage(message) {
  const messageElement = document.createElement("tr");
  const tableData = document.createElement("td");
  tableData.innerText = message;

  messageElement.append(tableData);
  sendContainer.append(messageElement);
}

function setRole(role) {
  if (!(role === "Host" || role === "Viewer")) {
    throw new Error("Invalid role provided to setRole() function");
  }

  roleLabel.innerText = role;

  let context = {
    role: role,
    name: name,
    id: socket.id,
  };

  removeButtons();

  socket.emit("set-role", roomName, context);
}

function removeButtons() {
  buttonHost.parentNode.removeChild(buttonHost);
  buttonViewer.parentNode.removeChild(buttonViewer);
}
