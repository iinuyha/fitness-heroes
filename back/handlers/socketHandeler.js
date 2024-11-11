const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'hi';

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
  const token = socket.handshake.auth.token || (socket.handshake.headers['authorization'] && socket.handshake.headers['authorization'].split(' ')[1]);
  if (!token) {
    console.error('토큰이 제공되지 않았습니다.');
    return next(new Error('Authentication error'));
  }

  const userId = decodeToken(token);
  if (!userId) {
    console.error('유효하지 않은 토큰입니다.');
    return next(new Error('Authentication error'));
  }

  socket.userId = userId; // 인증된 사용자 ID를 소켓에 저장
  next();
}

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST'],
    },
  });

  io.use(authenticateToken);

  const users = {}; // 사용자 ID와 소켓 ID 매핑을 저장하는 객체
  const activeChallenges = {}; // 대결 신청을 추적하는 객체

  io.on('connection', (socket) => {
    const userId = socket.userId;
    users[userId] = socket.id; // 사용자 ID와 소켓 ID 매핑 저장

    console.log(`사용자 연결됨: ${userId}`);

    // 대결 신청 이벤트 핸들러
    socket.on('challenge', (data) => {
      const { friendId } = data;

      // 친구가 접속 중인지 확인
      if (users[friendId]) {
        // 친구에게 대결 신청 이벤트 전송
        io.to(users[friendId]).emit('challengeRequest', {
          from: userId,
          timeLeft: 120 // 초기 남은 시간 120초
        });
        console.log(`사용자 ${userId}님이 사용자 ${friendId}님에게 대결 신청을 보냈습니다.`);

        // 대결 신청을 저장하고 2분 타이머 시작
        const challengeId = `${userId}-${friendId}`;
        if (activeChallenges[challengeId]) clearTimeout(activeChallenges[challengeId]); // 기존 타이머가 있으면 제거

        let timeLeft = 120; // 초기 남은 시간 120초

        // 남은 시간을 주기적으로 업데이트하여 clientB에게 전송
        const intervalId = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearInterval(intervalId);
            io.to(users[userId]).emit('challengeCancelled', {
              message: `2분이 지나 대결 신청이 자동으로 취소되었습니다: ${friendId}님과의 대결`,
            });
            delete activeChallenges[challengeId];
            console.log(`사용자 ${userId}님이 사용자 ${friendId}님에게 보낸 대결 신청이 자동으로 취소되었습니다.`);
          } else {
            io.to(users[friendId]).emit('timeUpdate', { timeLeft });
          }
        }, 1000); // 1초마다 남은 시간 업데이트

        // 2분 후 자동 취소 타이머 설정
        activeChallenges[challengeId] = setTimeout(() => {
          clearInterval(intervalId); // 주기적으로 남은 시간을 보내는 타이머도 중지
          io.to(users[userId]).emit('challengeCancelled', {
            message: `2분이 지나 대결 신청이 자동으로 취소되었습니다: ${friendId}님과의 대결`,
          });
          delete activeChallenges[challengeId]; // 완료된 대결 요청 삭제
          console.log(`사용자 ${userId}님이 사용자 ${friendId}님에게 보낸 대결 신청이 자동으로 취소되었습니다.`);
        }, 120 * 1000); // 120초 = 2분
      } else {
        console.log(`사용자 ${friendId}님은 현재 온라인이 아닙니다.`);
      }
    });

    // 연결 해제 시
    socket.on('disconnect', () => {
      console.log(`사용자 연결 해제됨: ${userId}`);
      delete users[userId]; // 연결 해제 시 매핑 제거

      // 사용자가 연결을 끊으면 그 사용자가 보낸 대결 요청을 취소
      for (const challengeId in activeChallenges) {
        if (challengeId.startsWith(`${userId}-`)) {
          clearTimeout(activeChallenges[challengeId]);
          delete activeChallenges[challengeId];
          console.log(`연결이 끊어진 사용자 ${userId}님의 모든 대결 신청이 취소되었습니다.`);
        }
      }
    });
  });
};
