const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // models/user.js 경로
const router = express.Router();

// 회원가입 API
router.post('/register', async (req, res) => {
  const { id, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ ok: false, message: "이미 사용 중인 ID입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 정보 저장
    const newUser = new User({ id, password: hashedPassword, email });
    await newUser.save();

    return res.status(201).json({ ok: true, message: "회원가입 성공!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "서버 오류" });
  }
});

// 로그인 API (기존 코드)
// ...
router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  // 로그인 로직...
});

module.exports = router;
