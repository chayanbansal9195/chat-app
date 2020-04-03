const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser
} = require("./utils/users");

const publicDirectorypath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectorypath));

let count = 0;
// when a client connects
io.on("connection", socket => {
  console.log("New Socket connected");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room
    });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin","Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(` ${user.username} has joined!`));
io.to(user.room).emit("roomData",{
    room:user.room,
    users:getUsersInRoom(user.room)
})
      callback()
  });

  // socket.emit, socket.broadcast.emit, io.emit,
  // io.to.emit, socket.broadcast.to.emit

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user=getUser(socket.id)
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username,message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
      const user=getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://google.com/maps?q=${coords.longitude}, ${coords.latitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
      const user=removeUser(socket.id)
      if(user){
        io.to(user.room).emit("message", generateMessage('Admin',` ${user.username} has left!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
      }
   
  });
  // ------------------------------------------------------------
  // for count code
  // socket.emit("countUpdated",count)
  // socket.on("increment",()=>{
  //     count++;
  //     // socket.emit("countUpdated",count)
  //     io.emit("countUpdated",count)
  // })
});

server.listen(port, () => {
  console.log("Server started at port " + port);
});
