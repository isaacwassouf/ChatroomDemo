const socket = io();
const chat = document.querySelector("#chat ul");
let typingTimeout;
let onTypingTimeOut = false;
let onTypingMessageShown = false;

localStorage.debug = 'socket.io-client:socket';

const getUsername = function(){
  const username = prompt("Enter a username");
  if (!username){
    alert("you must specify a username")
    getUsername();
  }else{
    socket.emit("username", username);
  }
}

const StopUserTyping = function(){
  onTypingTimeOut = false;
  socket.emit("stopTyping");
}

window.onload = function(){
  getUsername();
  this.document.getElementById("message").focus();
}

socket.on("usernameConnected", (username) => {
  const newMessage = document.createElement("li");
  newMessage.innerHTML = `${username} Just Connected`;
  chat.appendChild(newMessage);
})

document.getElementsByTagName("form")[0].addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("msg", document.getElementById("message").value);
  document.getElementById("message").value = "";

  // Stop the timout when the user send a message
  // To fix the issue when the typing message doesn't appear when the user starts typing before 2 sec have passed.
  clearTimeout(typingTimeout);
  StopUserTyping();
});

document.getElementById("message").addEventListener("keypress", (event) => {
  if (onTypingTimeOut) {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(StopUserTyping, 2000);
  } else {
    onTypingTimeOut = true;
    socket.emit("typing");

    typingTimeout = setTimeout(StopUserTyping, 2000);
  }
});

socket.on("typing", (username) => {
  if (onTypingMessageShown)
    return;
  onTypingMessageShown = true;
  const newMessage = document.createElement("li");
  newMessage.classList.add("typing");
  newMessage.innerHTML = `${username} is typing...`;
  chat.appendChild(newMessage);
});

socket.on("stopTyping", () => {
  // Check if the typing message is displayed, in case it got deleted when the server emited "msg" event
  //before the setTimeOut callback is called. or the callback was called before the message was sent.
  const typingMessage = document.querySelector(".typing");
  if (typingMessage) {
    onTypingMessageShown = false;
    typingMessage.remove();
  }
})

socket.on("msg", (msgObj) => {
  const TypingMessage = document.querySelector(".typing");
  const newMessage = document.createElement("li");
  newMessage.innerHTML = `${msgObj.from}: ${msgObj.msg}`;
  newMessage.classList.add("message");
  document.getElementById("message").value = "";

  typeof TypingMessage != "undefined" ? chat.insertBefore(newMessage, TypingMessage)
    : chat.appendChild(newMessage);
});

socket.on("disconnectUser", (username) => {
  const newMessage = document.createElement("li");
  newMessage.innerHTML = `${username}: Just Disconnected`;
  chat.appendChild(newMessage);
})
