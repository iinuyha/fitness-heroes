const express = require("express");
const jwt = require("jsonwebtoken"); 
const router = express.Router();
const Friend = require("../models/friend");

const secretKey = "hi"; // 인증에 사용할 비밀 키

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization 토큰이 필요합니다." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
    }
    req.user = user; // 사용자 정보 저장
    next();
  });
};

// 대결 기록 저장 API (인증 적용)
router.post("/save", authenticateToken, async (req, res) => {
  const { friendId, result } = req.body;
  const userId = req.user.id; // 토큰에서 추출한 사용자 ID

  // 요청 데이터가 충분한지 확인
  if (!friendId || !result) {
    return res.status(400).json({
      status: "error",
      message: "friendId와 result 필드는 필수입니다.",
    });
  }

  // result 값이 유효한지 확인
  const validResults = ["win", "draw", "lose"];
  if (!validResults.includes(result)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid result value. Expected one of ${validResults.join(", ")}.`,
    });
  }

  try {
    // 사용자의 대결 기록 조회
    let userRecord = await Friend.findOne({ id: userId });
    
    // 사용자 기록이 없으면 새로 생성
    if (!userRecord) {
      userRecord = new Friend({ id: userId, win: 0, draw: 0, lose: 0 });
    }

    // 대결 결과에 따라 기록을 업데이트
    if (result === "win") {
      userRecord.win += 1;
    } else if (result === "draw") {
      userRecord.draw += 1;
    } else if (result === "lose") {
      userRecord.lose += 1;
    }

    // 기록 저장
    await userRecord.save();

    // 성공 응답 반환
    return res.status(200).json({
      status: "success",
      message: "Match record saved successfully.",
      data: {
        userId: userRecord.id,
        friendId: friendId,
        result: result,
        updatedRecord: {
          win: userRecord.win,
          draw: userRecord.draw,
          lose: userRecord.lose,
        }
      }
    });
  } catch (error) {
    // 에러 처리
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to save match record.",
      error: error.message,
    });
  }
});

module.exports = router;
