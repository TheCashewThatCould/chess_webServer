const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fsPromises = require('fs').promises;
const path = require('path');

app.use(cors());
const data = {
    lobby: require('./data.json'),
    setLobby: function(arg) {this.lobby=arg}
}
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    },
}); 
io.on("connection", (socket) => {
    socket.on("send-message", data => {
        console.log(data.room+" "+data.message)
        socket.to(data.room).emit("recieve-message",data.message)
    })
    socket.on("join-home",()=>{
        socket.join("home")
    })
    socket.on("joinSession",  () => {
        if(data.lobby.held===""){
            socket.join(data.lobby.nextSessionId.toString())
            socket.emit("recieve-turn", true)
            socket.emit("recieve-room", data.lobby.nextSessionId.toString())
            data.setLobby({"held":"held","nextSessionId":data.lobby.nextSessionId})
        }
        else{ 
            socket.join(data.lobby.nextSessionId.toString())
            socket.emit("recieve-turn", false)
            socket.emit("recieve-room", data.lobby.nextSessionId.toString())
            socket.to(data.lobby.nextSessionId.toString()).emit("in-session",false)
            socket.emit("in-session",false)
            data.setLobby({"held":"","nextSessionId":data.lobby.nextSessionId+1})
        }
    })
    socket.on("make-move", (data) => {
        socket.to(data.room).emit("recieve-move",data.move)
    })
    socket.on("disconnect-from-home", () => {
        socket.leave("home")
    })
    socket.on("Disconnect", (room) => {
        socket.leave(room)
        socket.disconnect()
    })
})
server.listen(3500, () => {
    console.log("connected to server")
})