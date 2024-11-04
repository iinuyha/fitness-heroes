const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Character = require('../models/character');
const Story = require('../models/story');
const Friend = require('../models/friend');

const secretKey = "hi";


// Postman 확인용 토큰 생성
const testToken = jwt.sign({ id: "newUser123" }, secretKey);
console.log("생성된 토큰:", testToken);

// JWT 토큰에서 id를 추출하는 함수
function decodeToken(token) {
  try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
  } catch (error) {
      console.error("토큰 디코딩 오류:", error);
      return null;
  }
}

// 온보딩 정보 저장
router.post('/onboarding', async (req, res) => {
  try {
    // Authorization 헤더에서 토큰 추출 및 디코딩
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Authorization token이 필요합니다.' });
    }

    const token = authHeader.split(" ")[1];
    const id = decodeToken(token);
    if (!id) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    // Request Body에서 필요한 필드 가져오기
    const { name, birthdate, gender, concern, character } = req.body;

    // 온보딩에서 추가되는 데이터들
    const updateData = {
    name: name,
    birthdate: birthdate,
    gender: gender,
    concern: concern,
    character: character
    };
  
    await User.findOneAndUpdate(
        { id: id }, // 조건: id가 일치하는 사용자
        { $set: updateData }, // 업데이트할 데이터
        { new: true } // 업데이트된 문서 반환
    );
  

    // Character 테이블에 새로운 튜플 추가
    const newCharacter = new Character({
      id,
      character,
      coin: 0,
      skin: {
        "헬린이": 1,
        "초급자": 0,
        "중급자": 0,
        "고인물": 0
      },
      currentSkin: "헬린이"
    });
    await newCharacter.save();

    // Story 테이블에 새로운 튜플 추가
    const newStory = new Story({
      id,
      episode: 0,
      concern,
      date: new Date()
    });
    await newStory.save();

    // Friend 테이블에 새로운 튜플 추가
    const newFriend = new Friend({
      id,
      win: 0,
      draw: 0,
      lose: 0
    });
    await newFriend.save();

    // 성공 응답
    res.json({ message: "온보딩 정보가 성공적으로 저장되었습니다." });

  } catch (error) {
    console.error("온보딩 정보 저장 오류:", error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

module.exports = router;