const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io  = require("socket.io")(server);
const fs = require("fs");
const path = require("path");
const messageValidator = require("./validators/messageValidator");
const youtubeCode = require("./validators/youtubeUrl");

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
      socket.broadcast.emit("typing", username);
    });

    socket.on("stopTyping",()=>{
      socket.broadcast.emit("stopTyping", username);
      // TODO: delete only the user typing message
    })

    socket.on("msg", (msg)=>{
      const response = {from: username, id: socket.id,text: msg};
      if (messageValidator(msg)){
        let code;
        if(code = youtubeCode(msg)){
          io.emit("youtube_message", {
            ...response,
            code
          })
        }else{
          io.emit("msg",response);
        }
      }
    });

    socket.on("image", (message)=>{
      const includesExtention = new RegExp("\\.[a-zA-Z]+$").test(message.image.name);
      fs.writeFileSync(
        includesExtention ? `./${message.image.name}` : `./${message.image.name}.${message.image.type}`
        , message.image.data
      );
      io.emit("image",{
        from: username,
        id: socket.id ,
        caption: messageValidator(message.caption) ? message.caption: "",
        image: {
            data: message.image.data.toString("base64"),
            type: message.image.type
        }
      });
    });

    socket.on("disconnect", ()=>{
      io.emit("disconnectUser", username);
      console.log("A user disconnected");
    });
});

server.listen(5001, () => {
  console.log("Listening on port 5001");
});
