const roomCounts = {};
const roomReadyStates = require("./inviteFriend"); // 공유된 roomReadyStates 불러오기

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

  socket.on("ready", ({ roomId }) => {
    console.log(`${socket.userId}님이 방 ${roomId}에서 준비 완료`);

    if (!roomReadyStates[roomId]) {
      console.error(`방 ${roomId} 상태가 초기화되지 않았습니다.`);
      roomReadyStates[roomId] = {}; // 상태 초기화
    }

    // 현재 사용자를 준비 상태로 설정
    roomReadyStates[roomId][socket.userId] = true;

    // 방의 사용자 목록 가져오기
    const roomUsers = Object.keys(roomReadyStates[roomId]); // roomReadyStates 기준

    // 모든 사용자가 준비되었는지 확인
    const allReady =
      roomUsers.length === 2 && // 방에 사용자가 두 명이어야 하고
      roomUsers.every((user) => roomReadyStates[roomId][user] === true); // 두 명 모두 준비 상태여야 함

    if (allReady) {
      console.log(`방 ${roomId}의 모든 사용자가 준비 완료. 카운트다운 시작.`);
      io.to(roomId).emit("startCountdown"); // 카운트다운 시작 이벤트 전송
    } else {
      console.log(
        `방 ${roomId}: 일부 사용자 준비 중. 현재 상태:`,
        roomReadyStates[roomId]
      );
      socket.to(roomId).emit("opponentReady", { userId: socket.userId });
    }
  });

  socket.on("disconnectFromChallenge", ({ roomId }) => {
    console.log(`${socket.userId}님이 방 ${roomId}에서 나갔습니다.`);
    socket.leave(roomId);
    io.to(roomId).emit("userLeft");
  });

  socket.on("endChallenge", ({ roomId }) => {
    console.log(`방 ${roomId}에서 대결이 종료되었습니다.`);
    io.to(roomId).emit("challengeEnded", { message: "대결이 종료되었습니다." });
    io.socketsLeave(roomId); // 방에 있는 모든 소켓을 방에서 제거
  });
}

module.exports = { startChallenge };
