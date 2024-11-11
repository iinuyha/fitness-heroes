const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'hi'; // 서버와 동일한 SECRET_KEY

// JWT 토큰 생성 함수
function generateToken(userId) {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' }); // 1시간 동안 유효한 토큰
}

// 사용자 A와 B를 위한 JWT 토큰 생성
const tokenA = generateToken('userA'); // userA의 토큰
const tokenB = generateToken('userB'); // userB의 토큰

// 생성된 토큰을 콘솔에 출력하여 확인
console.log('Token for userA:', tokenA);
console.log('Token for userB:', tokenB);

// Client A: 대결 신청을 보내는 사용자
const clientA = io('http://localhost:3001', {
  auth: { token: tokenA },
  transports: ['websocket'],
  perMessageDeflate: false,
});

const clientB = io('http://localhost:3001', {
  auth: { token: tokenB },
  transports: ['websocket'],
  perMessageDeflate: false,
});

// Client A 이벤트 핸들러
clientA.on('connect', () => {
  console.log('Client A (userA) connected');

  // 3초 후에 대결 신청을 userB에게 보냄
  setTimeout(() => {
    console.log('Client A가 userB에게 대결 신청을 보냈습니다.');
    clientA.emit('challenge', { friendId: 'userB' });
  }, 3000);
});

// Client B 이벤트 핸들러
clientB.on('connect', () => {
  console.log('Client B (userB) connected');
});

// Client B가 대결 신청을 수신할 때 처리
clientB.on('challengeRequest', (data) => {
  console.log(`Client B received a challenge request from user: ${data.from}`);
  
  // 남은 시간 업데이트
  if (data.timeLeft) {
    console.log(`남은 시간: ${data.timeLeft}초`);
  }
});

// 주기적으로 서버로부터 남은 시간을 수신하는 이벤트
clientB.on('timeUpdate', (data) => {
  console.log(`남은 시간 업데이트: ${data.timeLeft}초`);
});

// 연결 해제 시 처리 (테스트 용도)
clientA.on('disconnect', () => {
  console.log('Client A disconnected');
});

clientB.on('disconnect', () => {
  console.log('Client B disconnected');
});

clientA.on('error', (error) => {
  console.log('Client A error:', error);
});

clientB.on('error', (error) => {
  console.log('Client B error:', error);
});
