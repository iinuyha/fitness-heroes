const roomCounts = {};

function startChallenge(io, socket) {
  socket.on("startWebRTC", ({ roomId }) => {
    console.log(`startWebRTC 이벤트 수신: 방 ${roomId}`);
    // 방에 있는 사용자들에게 신호를 보냄
    io.to(roomId).emit("startWebRTC", { roomId });
  });

  socket.on("offer", ({ offer, roomId }) => {
    console.log(`offer 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 offer 전달
    socket.to(roomId).emit("offer", { offer, roomId });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log(`answer 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 answer 전달
    socket.to(roomId).emit("answer", { answer, roomId });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log(`ICE 후보 수신: 방 ${roomId}`);
    // 방의 다른 사용자에게 ICE 후보 전달
    socket.to(roomId).emit("ice-candidate", { candidate, roomId });
  });
  // 점프잭 카운트 업데이트
  socket.on("updateCount", ({ roomId, count }) => {
    if (!roomCounts[roomId]) {
      roomCounts[roomId] = {};
    }
    roomCounts[roomId][socket.userId] = count;

    console.log(
      `사용자 ${socket.userId}의 점프잭 카운트가 ${count}로 업데이트됨 (방: ${roomId})`
    );

    socket.to(roomId).emit("updatedCount", {
      userId: socket.userId,
      count,
    });
  });

  socket.on("disconnectFromChallenge", ({ roomId }) => {
    console.log(`${socket.userId}님이 방 ${roomId}에서 나갔습니다.`);
    socket.leave(roomId);
    io.to(roomId).emit("userLeft", { userId: socket.userId });
  });

  socket.on("endChallenge", ({ roomId }) => {
    console.log(`방 ${roomId}에서 대결이 종료되었습니다.`);
    io.to(roomId).emit("challengeEnded", { message: "대결이 종료되었습니다." });
    io.socketsLeave(roomId); // 방에 있는 모든 소켓을 방에서 제거
  });
}

module.exports = { startChallenge };
