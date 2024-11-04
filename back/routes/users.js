// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User 모델 가져오기
const router = express.Router();

// JWT 비밀 키 (환경 변수로 관리하는 것이 좋습니다)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 로그인 엔드포인트
router.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ ok: false, message: "존재하지 않는 사용자입니다.", error: "UserNotFound" });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "비밀번호가 일치하지 않습니다.", error: "WrongPassword" });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // 사용자 데이터 및 토큰 응답
    return res.status(200).json({ token, id: user.id, isFirstTime: !user.name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "서버 오류" });
  }
});

module.exports = router;
