//스토리 조회
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Story = require('../models/story'); 

const secretKey = "hi"; // 환경 변수 대신 character.js에서 사용하는 동일한 key 사용

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  // Authorization 헤더 확인
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Authorization 토큰이 필요합니다.' });
  }

  // 토큰 추출
  const token = authHeader.split(" ")[1];

  // 토큰 검증
  jwt.verify(token, secretKey, (err, user) => { // 수정: JWT_SECRET 대신 secretKey 사용
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// GET /api/story 엔드포인트
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 토큰에서 추출한 사용자 ID

    // 데이터베이스에서 사용자 스토리 에피소드 조회
    const storyEpisodes = await Story.find({ id: userId });

    // 스토리 에피소드가 있는지 확인
    if (!storyEpisodes || storyEpisodes.length === 0) {
      return res.status(404).json({ error: '스토리 에피소드를 찾을 수 없습니다.' });
    }

    // 에피소드 데이터를 JSON 응답으로 전송
    res.json(storyEpisodes.map(episode => ({
      concern: episode.concern,
      episode: episode.episode,
      date: episode.date.toISOString().split('T')[0], 
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류입니다.' });
  }
});

module.exports = router;