// 운동 정보 조회
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Exercise = require('../models/exercise');

const secretKey = "hi"; // 환경 변수 대신 설정한 비밀 키 사용

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Authorization 토큰이 필요합니다.' });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// GET /api/exercise 엔드포인트
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { concern, gender } = req.body;

    // 데이터베이스에서 운동 정보 조회
    const exerciseInfo = await Exercise.findOne({ concern, gender });

    if (!exerciseInfo) {
      return res.status(404).json({ error: '운동 정보를 찾을 수 없습니다.' });
    }

    // 운동 정보 데이터를 JSON 응답으로 전송
    res.json({
      exe_name: exerciseInfo.exe_name,
      episode: exerciseInfo.episode,
      exe_set: exerciseInfo.exe_set,
      exe_count: exerciseInfo.exe_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류입니다.' });
  }
});

module.exports = router;
