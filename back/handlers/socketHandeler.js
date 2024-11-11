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
    // auth 옵션과 Authorization 헤더 모두에서 토큰을 검사
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

  io.on('connection', (socket) => {
    const userId = socket.userId;
    users[userId] = socket.id; // 사용자 ID와 소켓 ID 매핑 저장

    console.log(`User connected: ${userId}`);

    // 대결 신청 이벤트 핸들러
    socket.on('challenge', (data) => {
      const { friendId } = data;

      // 친구가 접속 중인지 확인
      if (users[friendId]) {
        // 친구에게 대결 신청 이벤트 전송
        io.to(users[friendId]).emit('challengeRequest', {
          from: userId,
        });
        console.log(`Challenge request sent from ${userId} to ${friendId}`);
      } else {
        console.log(`User ${friendId} is not online`);
      }
    });

    // 연결 해제 시
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      delete users[userId]; // 연결 해제 시 매핑 제거
    });
  });
};
