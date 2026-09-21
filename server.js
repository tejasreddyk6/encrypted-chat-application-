const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


app.use(express.static(__dirname));


io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("chat message", (data) => {

        io.emit("chat message", data);

    });

    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

    });

});

server.listen(PORT, "0.0.0.0", () => {

    console.log(`Encrypted Chat Server running on port ${PORT}`);

});