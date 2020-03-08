const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io  = require("socket.io")(server);
const path = require("path");

app.set("view engin", "ejs");

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req,res)=>{
    res.render("./index.ejs");
});

io.on("connection", (socket)=>{
    console.log("A user connected");
    let username;

    socket.on("username",(_username)=>{
      username = _username;
      io.emit("usernameConnected", username);
    });

    socket.on("typing", ()=>{
      //Send to all socket except the sender
      socket.broadcast.emit("typing", username);
    });

    socket.on("stopTyping",()=>{
      socket.broadcast.emit("stopTyping");
      // TODO: delete only the user typing message
    })

    socket.on("msg", (msg)=>{
      io.emit("msg",{from: username,msg});
      socket.broadcast.emit("stopTyping");
    });

    socket.on("disconnect", ()=>{
      io.emit("disconnectUser", username);
      console.log("A user disconnected");
    });

    socket.on("reconnected", ()=>{
      console.log("A user reconnected");
      io.emit("usernameConnected", username);
    })
});

server.listen(5001, () => {
  console.log("Listening on port 5001");
});
