const express = require('express');
const router = express.Router();
const Friend = require('../models/friend');
const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const secretKey = "hi";

// JWT 토큰에서 id를 추출하는 함수
function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// 친구 목록 조회 라우트
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Authorization token이 필요합니다.' });
    }

    const token = authHeader.split(" ")[1];
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    // 현재 사용자 ID로 친구 목록 가져오기
    const friendInfo = await Friend.findOne({ id: userId });
    if (!friendInfo || !friendInfo.friend) {
      return res.status(404).json({ error: '친구 정보를 찾을 수 없습니다.' });
    }

    // 친구의 각 ID로 이름, 승/무/패 데이터를 가져오기
    const friendsData = await Promise.all(friendInfo.friend.map(async friendId => {
      const friendData = await Friend.findOne({ id: friendId }) || { win: 0, draw: 0, lose: 0 };
      const userData = await User.findOne({ id: friendId }) || { name: "이름 없음" };

      return {
        id: friendId,
        name: userData.name,
        win: friendData.win,
        draw: friendData.draw,
        lose: friendData.lose
      };
    }));

    res.json({ friends: friendsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

// 친구 검색 및 추가
router.post('/search', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Authorization token이 필요합니다.' });
    }

    const token = authHeader.split(" ")[1];
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const { id: searchId } = req.body;
    if (!searchId) {
      return res.status(400).json({ error: '검색할 친구의 ID가 필요합니다.' });
    }

    // 자신을 친구로 추가하려는 경우 오류 반환
    if (searchId === userId) {
      return res.status(400).json({ error: '자신을 친구로 추가할 수 없습니다.' });
    }

    // 검색할 친구가 존재하는지 확인
    const friendData = await Friend.findOne({ id: searchId });
    if (!friendData) {
      return res.status(404).json({ error: '친구를 찾을 수 없습니다.' });
    }

    // 현재 사용자의 친구 목록에 추가
    let userFriendData = await Friend.findOne({ id: userId });
    if (!userFriendData) {
      userFriendData = new Friend({ id: userId, friend: [] });
    }

    // 이미 친구 목록에 있는지 확인 후 추가
    if (!userFriendData.friend.includes(searchId)) {
      userFriendData.friend.push(searchId);
      await userFriendData.save();
    } else {
      return res.status(400).json({ error: '이미 친구 목록에 있는 사용자입니다.' });
    }

    res.json({
      message: '친구가 성공적으로 추가되었습니다.',
      friend: {
        id: friendData.id,
        // 친구 데이터 추가 가능
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

module.exports = router;
