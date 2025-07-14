import express from 'express';
import cors from 'cors';
import http from 'http';
import "dotenv/config";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Store online users
export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected with ID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // ✅ Handle manual logout event
  socket.on("logout", (id) => {
    console.log("User manually logged out:", id);
    delete userSocketMap[id];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // ✅ Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Add root route to handle "Cannot GET /" error
app.get("/", (req, res) => {
  res.json({ 
    message: "Chat App Backend API", 
    status: "Server is running",
    endpoints: {
      status: "/api/status",
      auth: "/api/auth",
      messages: "/api/messages"
    }
  });
});


app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

if(process.env.NODE_ENV !=="production"){
  const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT:", PORT));

}


//here we export server for vercel
export default server;