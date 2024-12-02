const express = require("express");
const jwt = require("jsonwebtoken"); 
const router = express.Router();
const Friend = require("../models/friend");
const Character = require("../models/character");
const Challenge = require("../models/challenge");

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

// 코인 확인
router.post("/check-coin", authenticateToken, async (req, res) => {
  const userId = req.user.id; // 토큰에서 추출한 사용자 ID

  try {
    // 사용자 캐릭터 조회
    let character = await Character.findOne({ id: userId });

    // 캐릭터가 존재하지 않으면 에러 반환
    if (!character) {
      return res.status(404).json({
        status: "error",
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    // 코인이 3 이상인지 확인
    if (character.coin >= 3) {

      // 성공 응답 반환
      return res.status(200).json({
        status: "success",
        message: "코인이 3개 이상 있습니다.",
        data: {
          canProceed: true,
        },
      });
    } else {
      // 코인이 부족한 경우
      return res.status(200).json({
        status: "fail",
        message: "코인이 부족합니다.",
        data: {
          canProceed: false,
        },
      });
    }
  } catch (error) {
    // 에러 처리
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "코인 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

// 코인 차감
router.post("/reduce-coin", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 캐릭터 정보 조회
    const character = await Character.findOne({ id: userId });
    if (!character) {
      return res.status(404).json({ error: "캐릭터 정보를 찾을 수 없습니다." });
    }

    // 코인 차감
    character.coin -= 3;
    await character.save();

    res.json({ message: "코인이 성공적으로 차감되었습니다.", coin: character.coin });
  } catch (error) {
    console.error("코인 차감 오류:", error);
    res.status(500).json({ error: "코인 차감 실패" });
  }
});

// Challenge status를 declined로 변경
router.post("/status-declined", async (req, res) => {
  const { roomId } = req.body;

  try {
    // roomId에서 챌린저와 챌린지드 ID 추출
    const [challengerId, challengedId] = roomId.split("-");

   // 가장 최근의 Challenge 데이터 가져오기
   const matchData = await Challenge.findOne(
    { challengerId: challengerId, challengedId: challengedId } 
    ).sort({ createdAt: -1 });


    if (!matchData) {
      return res.status(404).json({
        status: "error",
        message: "해당 데이터를 찾을 수 없습니다.",
      });
    }

    matchData.status = "declined";
    await matchData.save();
    

    // 성공 응답 반환
    return res.status(200).json({
      status: "success",
      message: "status 상태가 declined로 변경되었습니다.",
      data: {
        matchData: matchData, // 업데이트된 문서 수 반환
      },
    });
    } catch (error) {
      // 에러 처리
      console.error("status 상태 변경 오류:", error);
      return res.status(500).json({
        status: "error",
        message: "status 상태 변경 중 오류가 발생했습니다.",
        error: error.message,
      });
    }
});




module.exports = router