const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./Routes/userRoute");
const chatRouter = require("./Routes/chatRoute");
const messageRouter = require("./Routes/messageRoute");

const app = express();
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);

const socketio = require("socket.io");
const io = socketio(server, {
    cors: {
        origin: "*", // Adjust based on your security requirements
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.locals.io = io;




// ------ socket.io ------------
let onlineUsers = [];

io.on("connection", (socket) => {
    // console.log("new connnection", socket.id);
    //listen to a connection
    socket.on("addNewUser", (userId) => {
        // io.emit("receiveMessage", message);
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
        console.log("onlineUsers", onlineUsers);

        io.emit("getOnlineUsers", onlineUsers);

    });



    //add message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find(
            (user) => user.userId === message.recipientId
        );

        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                data: new Date()
            });
        }
    });

    socket.on("disconnect", () => {
        // console.log("user disconnected:", socket.id);
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

module.exports = io;










app.use(express.json());
app.use(cors());
app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
    res.send("Welcome to Chat app API");
});

const port = process.env.PORT || 5002;
const URL = process.env.ATLAS_URL;

// app.listen(port, (req, res) => {
//     console.log(`Server is running on port ${port}`);
// });

mongoose
    .connect(URL)
    .then(() => {
        console.log("MongoDb is established");
    })
    .catch((err) => {
        console.log("MongoDb connection failed", err.message);
    });


const start = async () => {

    try {
        server.listen(port, console.log(`it's listening ${port}  `));
    } catch (err) {
        console.log(err);
    }
};

start();