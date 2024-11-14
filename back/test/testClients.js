// const express = require("express");
// const http = require("http");
// const jwt = require("jsonwebtoken");
// const { Server } = require("socket.io");

// const SECRET_KEY = "hi";
// const app = express();
// const server = http.createServer(app); // 동일한 Express 서버에서 실행
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// // Express 미들웨어 및 라우터 설정
// app.use(express.json());
// // 예시: CRUD 라우트 설정
// app.get("/api/example", (req, res) => {
//   res.json({ message: "Example endpoint working!" });
// });

// // Socket.IO 미들웨어 설정
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (token) {
//     jwt.verify(token, SECRET_KEY, (err, decoded) => {
//       if (err) return next(new Error("Authentication error"));
//       socket.userId = decoded.id;
//       next();
//     });
//   } else {
//     next(new Error("Authentication error"));
//   }
// });

// const activeUsers = {};

// io.on("connection", (socket) => {
//   activeUsers[socket.userId] = socket.id;
//   console.log(`웹소켓 User connected: ${socket.userId}`);
//   io.emit("userStatusUpdate", { userId: socket.userId, isOnline: true });

//   socket.on("sendChallenge", ({ to }) => {
//     const targetSocketId = activeUsers[to];
//     if (targetSocketId) {
//       const roomId = `room-${socket.userId}-${to}`;
//       socket.join(roomId);
//       io.to(targetSocketId).emit("challengeReceived", {
//         from: socket.userId,
//         roomId,
//       });
//     }
//   });

//   socket.on("acceptChallenge", ({ roomId }) => {
//     socket.join(roomId);
//     io.to(roomId).emit("startGame", { roomId });
//   });

//   socket.on("declineChallenge", ({ to }) => {
//     const inviterSocketId = activeUsers[to];
//     if (inviterSocketId) {
//       io.to(inviterSocketId).emit("challengeDeclined");
//     }
//   });

//   socket.on("offer", ({ offer, roomId }) => {
//     socket.to(roomId).emit("offer", { offer });
//   });

//   socket.on("answer", ({ answer, roomId }) => {
//     socket.to(roomId).emit("answer", { answer });
//   });

//   socket.on("disconnect", () => {
//     delete activeUsers[socket.userId];
//     io.emit("userStatusUpdate", { userId: socket.userId, isOnline: false });
//   });
// });

// // 동일한 포트에서 Express와 Socket.IO 서버 모두 실행
// server.listen(3001, () => {
//   console.log("Server running on port 3001");
// });
