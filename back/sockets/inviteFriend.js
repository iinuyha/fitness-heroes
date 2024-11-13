const users = {}; // 사용자 ID와 소켓 ID 매핑을 저장하는 객체
const activeChallenges = {}; // 대결 신청을 추적하는 객체

function handleChallenge(io, socket) {
  const userId = socket.userId;

  socket.on("sendChallenge", (data) => {
    console.log("대결 신청 수신:", data);
    const { friendId } = data;

    if (users[friendId]) {
      const roomId = `${userId}-${friendId}`; // roomId 생성
      socket.join(roomId); // 초대한 사용자도 roomId에 참가
      console.log(`${userId}님이 방 ${roomId}에 참가했습니다.`);

      io.to(users[friendId]).emit("challengeReceived", {
        from: userId,
        roomId, // roomId도 함께 전송
      });
      console.log(`${userId}님이 ${friendId}님에게 대결 신청을 보냈습니다.`);

      const challengeId = roomId;
      if (activeChallenges[challengeId])
        clearTimeout(activeChallenges[challengeId]);

      let timeLeft = 120;

      // 대결 신청받은 사람 측
      const intervalId = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(intervalId);
          io.to(users[userId]).emit("challengeCancelled", {
            message: `2분이 지나 ${friendId}님과의 대결이 자동으로 취소되었습니다.`,
          });
          delete activeChallenges[challengeId];
          io.socketsLeave(roomId); // roomId에 참여한 모든 소켓을 방에서 제거
          console.log(
            `대결이 자동으로 취소되었습니다: ${userId} -> ${friendId}`
          );
        } else {
          io.to(users[friendId]).emit("timeUpdate", { timeLeft });
        }
      }, 1000);

      // 대결 신청한 사람 측
      activeChallenges[challengeId] = setTimeout(() => {
        clearInterval(intervalId);
        io.to(users[userId]).emit("challengeCancelled", {
          message: `2분이 지나 ${friendId}님과의 대결 신청이 자동으로 취소되었습니다.`,
        });
        delete activeChallenges[challengeId];
        io.socketsLeave(roomId); // roomId에 참여한 모든 소켓을 방에서 제거
        console.log(`방 ${roomId}이 삭제되었습니다.`);
      }, 120 * 1000);
    } else {
      socket.emit("error", { message: "Friend is offline" });
      console.log(`${friendId}님은 현재 온라인이 아닙니다.`);
    }
  });

  socket.on("acceptChallenge", ({ roomId }) => {
    io.to(roomId).emit("gameStart", { roomId });
  });

  socket.on("declineChallenge", ({ roomId }) => {
    io.to(roomId).emit("challengeDeclined", {
      message: "대결이 성사되지 않았습니다.",
    });
    io.socketsLeave(roomId); // 방에 있는 모든 소켓을 방에서 제거

    // 방 삭제 로그 출력
    console.log(`대결 거절로 인해 방 ${roomId}이 삭제되었습니다.`);
  });

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.userId}님이 방 ${roomId}에 참가했습니다.`);
  });
}

module.exports = {
  handleChallenge,
  users,
  activeChallenges,
};
