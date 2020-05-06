const socket = io("http://localhost:3000");

const sendContainer = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const name = prompt("What is your name?");
appendMessage("You joined");
socket.emit("new-user", name);

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
  appendMessage(`${name} discconnected`);
});

socket.on("logger", (data) => {
  console.log(data);
});

sendContainer.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value;
  appendMessage(`You: ${message}`)
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

function appendMessage(message) {
  const messageElement = document.createElement("tr");
  const tableData = document.createElement("td");
  tableData.innerText = message;

  messageElement.append(tableData);
  sendContainer.append(messageElement);
}
