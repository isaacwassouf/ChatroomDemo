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

const ScollDown =  function () {
  const objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

const messageReceiverHandler = function(message){
  const newMessage = document.createElement("li");
  newMessage.classList.add("message");

  if (message.id === socket.id){
    newMessage.style.float = "right";
    newMessage.innerHTML = `${message.text}`;
  }else{
    newMessage.innerHTML = `${message.from}: ${message.text}`;
  }

  document.getElementById("message").value = "";

   onTypingMessageShown ? chat.insertBefore(newMessage, document.querySelector(".typing"))
    : chat.appendChild(newMessage);
  ScollDown();
  return newMessage;
}

window.onload = function(){
  getUsername();
  ScollDown();
  this.document.getElementById("message").focus();
  axios.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=evcMQ7Lk8NU&key=AIzaSyCQdpmZ5y6HntMzAdrPAoBM3xGCvMENFeo").then(data=>{
    console.log(data);
  }).catch(error => console.log(error))
}

socket.on("usernameConnected", (username) => {
  const newMessage = document.createElement("li");
  newMessage.innerHTML = `${username} Just Connected`;
  newMessage.style.textDecoration= "underline dotted";
  newMessage.style.backgroundColor = "#495057";
  newMessage.style.color = "#ffffff";
  chat.appendChild(newMessage);
  ScollDown();
})

document.getElementsByTagName("form")[0].addEventListener("submit", (e) => {
  e.preventDefault();

  if (document.getElementById("file").files.length > 0){
    const file = document.getElementById("file").files[0];

    if (file.type.split("/")[0] === "image"){
      socket.emit("image",{
        caption: document.getElementById("message").value,
        image: {
          name: document.getElementById("file").files[0].name,
          data: document.getElementById("file").files[0],
          type: document.getElementById("file").files[0].type.split("/")[1]
        }
      });
    }
    document.getElementById("file").value = null;
  }else{
    const messageText = document.getElementById("message").value;
    socket.emit("msg",messageText);
  }
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
  newMessage.classList.add(`typing`);
  newMessage.classList.add(`typing-${username}`);
  newMessage.innerHTML = `${username} is typing...`;
  chat.appendChild(newMessage);
});

socket.on("stopTyping", (username) => {
  // Check if the typing message is displayed, in case it got deleted when the server emited "msg" event
  //before the setTimeOut callback is called. or the callback was called before the message was sent.
  const typingMessage = document.querySelector(`.typing-${username}`);
  if (typingMessage) {
    onTypingMessageShown = false;
    typingMessage.remove();
  }
})

socket.on("msg", messageReceiverHandler);

socket.on("youtube_message", (message)=>{
  const li =  messageReceiverHandler(message);
  axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${message.code}&key=AIzaSyCQdpmZ5y6HntMzAdrPAoBM3xGCvMENFeo`).then(data=>{
    const snippet = data.data.items[0].snippet;
    const thumbnail = document.createElement("img");
    const link = document.createElement("a");
    const title = document.createElement("p");
    // Setup Thumbnail
    thumbnail.src = snippet.thumbnails.maxres.url;
    thumbnail.style.width = "100%";
    thumbnail.style.height = "100%";
    thumbnail.style.marginTop = "5px";
    thumbnail.style.marginBottom = "5px";
    thumbnail.style.borderRadius = "15px";
    // setup link
    link.href = `https://www.youtube.com/watch?v=${message.code}`;
    link.target = "_blank";
    // setup title
    title.innerHTML = snippet.title;
    title.style.margin= "0px 0px 5px 0px";
    // setup description
    link.appendChild(thumbnail);
    li.appendChild(link);
    li.appendChild(title);
  });

})

socket.on("image",(msgObj)=>{

  const newMessage = document.createElement("li");
  newMessage.classList.add("message");


  if(msgObj.caption != ""){
    const caption = document.createElement("p");
    if (msgObj.id === socket.id)
      caption.innerHTML = `${msgObj.caption}`;
    else
      caption.innerHTML = `${msgObj.from}: ${msgObj.caption}`;

    caption.style.margin = "0px 0px 5px 0px";
    newMessage.appendChild(caption);
  }

  const img = document.createElement("img");
  img.src = `data:image/${msgObj.image.type};base64,` + msgObj.image.data;
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";

  newMessage.appendChild(img);
  if (msgObj.id === socket.id)
      newMessage.style.float = "right";

  chat.appendChild(newMessage);
  ScollDown();

})

socket.on("disconnectUser", (username) => {
  const newMessage = document.createElement("li");
  newMessage.innerHTML = `${username} Just Disconnected`;
  newMessage.style.backgroundColor = "#d32f2f";
  newMessage.style.color =  "#fff";
  chat.appendChild(newMessage);
})

socket.on("reconnect", (attemp)=>{
  getUsername();
})

document.getElementsByClassName("fa-file-image")[0].addEventListener("click",(event)=>{
  document.getElementById("file").click();
})

