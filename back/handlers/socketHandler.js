const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const {
  handleChallenge,
  users,
  activeChallenges,
} = require("../sockets/inviteFriend");

const SECRET_KEY = "hi";

function decodeToken(token) {
  if (!token) {
    console.error("토큰이 제공되지 않았습니다.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.id;
  } catch (error) {
    console.error("토큰 디코딩 오류:", error.message);
    return null;
  }
}

function authenticateToken(socket, next) {
  const token =
    socket.handshake.auth.token ||
    (socket.handshake.headers["authorization"] &&
      socket.handshake.headers["authorization"].split(" ")[1]);
  if (!token) {
    console.error("토큰이 제공되지 않았습니다.");
    return next(new Error("Authentication error"));
  }

  const userId = decodeToken(token);
  if (!userId) {
    console.error("유효하지 않은 토큰입니다.");
    return next(new Error("Authentication error"));
  }

  socket.userId = userId;
  next();
}

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });

  io.use(authenticateToken);

  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    const userId = decodeToken(token); // 예: decodeToken 함수를 이용해 userId 추출
    console.log(`클라이언트 연결됨: ${userId}`);
    users[userId] = socket.id;

    // 소켓에 연결되면 온라인 상태를 true로 (userStatusUpdate 이벤트 발생시키기)
    io.emit("userStatusUpdate", { userId, isOnline: true });

    // 친구 초대 관련 이벤트 핸들링
    handleChallenge(io, socket);

    socket.on("offer", ({ offer, roomId }) => {
      socket.to(roomId).emit("offer", { offer });
    });

    socket.on("answer", ({ answer, roomId }) => {
      socket.to(roomId).emit("answer", { answer });
    });

    socket.on("disconnect", () => {
      console.log("클라이언트 연결 해제됨:", socket.id);
      io.emit("userStatusUpdate", { userId, isOnline: false });
      delete users[userId];

      for (const challengeId in activeChallenges) {
        if (challengeId.startsWith(`${userId}-`)) {
          clearTimeout(activeChallenges[challengeId]);
          delete activeChallenges[challengeId];
          console.log(
            `연결이 끊어진 사용자 ${userId}님의 모든 대결 신청이 취소되었습니다.`
          );
        }
      }
    });
  });
};
