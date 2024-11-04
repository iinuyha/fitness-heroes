const express = require('express');
const router = express.Router();
const Character = require('../models/character');
const Skin = require('../models/skin');
const secretKey = "hi";

// JWT 토큰에서 userId를 추출하는 함수
function decodeToken(token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.userId;
    } catch (error) {
      console.error("토큰 디코딩 오류:", error);
      return null;
    }
}

// 캐릭터 정보 조회
router.get('/', async function(req, res, next) {
    try {
    // Authorization 헤더 체크
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: 'Authorization token이 필요합니다.' });
    }
      
    // "Bearer " 이후의 실제 토큰 부분만 가져옴
    const token = authHeader.split(" ")[1];
      
    // 토큰에서 사용자 ID 추출
    const userId = decodeToken(token);
    if (!userId) {
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
      
    // MongoDB에서 id에 맞는 캐릭터 정보 조회
    const characterInfo = await Character.findOne({ id: userId });
      
    if (!characterInfo) {
        return res.status(404).json({ error: '캐릭터 정보를 찾을 수 없습니다.' });
    }
      
    // 캐릭터 정보를 JSON 응답으로 전송
    res.json({
        character: characterInfo.character,
        coin: characterInfo.coin,
        currentSkin: characterInfo.currentSkin,
        skins: characterInfo.skin
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
});

// 스킨 구매
router.patch('/buy-skin', async (req, res) => {
  try {
    // Authorization 헤더 체크
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Authorization token이 필요합니다.' });
    }

    // "Bearer " 이후의 실제 토큰 부분만 가져오기
    const token = authHeader.split(" ")[1];

    // 토큰에서 userId 추출
    const userId = decodeToken(token);
    if (!userId) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    // Request body에서 skin_name 가져오기
    const { skin_name } = req.body;
    if (!skin_name) {
      return res.status(400).json({ error: '스킨 이름이 필요합니다.' });
    }

    // Skin 테이블에서 스킨 가격 조회
    const skin = await Skin.findOne({ skin_name });
    if (!skin) {
      return res.status(404).json({ error: '해당 스킨을 찾을 수 없습니다.' });
    }
    const skinPrice = skin.skin_price;

    // Character 테이블에서 사용자 캐릭터 정보 조회
    const character = await Character.findOne({ id: userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터 정보를 찾을 수 없습니다.' });
    }

    // 코인이 충분한지 확인
    if (character.coin < skinPrice) {
      return res.status(400).json({ message: '코인이 부족합니다.', remainingCoin: character.coin });
    }

    // 구매 가능: 코인 차감 및 스킨 소유 상태 업데이트
    character.coin -= skinPrice;
    if (!character.skin) character.skin = {}; // 스킨 객체 초기화
    character.skin[skin_name] = 1; // 소유 상태를 1로 변경

    // 변경된 정보 저장
    await character.save();

    // 성공 응답
    res.json({
      message: `${skin_name} 스킨을 성공적으로 구매했습니다.`,
      remainingCoin: character.coin,
      skins: character.skin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});


module.exports = router;
