const express = require("express");
const mongoose = require("mongoose");
const Challenge = require("../models/challenge"); 
const Friend = require("../models/friend");       

const router = express.Router();

// 게임 결과 저장 API
router.post("/", async (req, res) => {
  const { challengerId, challengedId, challengerScore, challengedScore } = req.body;

  // 1. 요청 데이터 검증
  if (!challengerId || !challengedId || challengerScore === undefined || challengedScore === undefined) {
    return res.status(400).json({ message: "Invalid input data." });
  }

  try {
    // 2.이긴사람 누구인지
    const winnerId = 
      challengerScore > challengedScore ? challengerId : 
      challengerScore < challengedScore ? challengedId : null; // 무승부는 winnerId가 null

    // 3. Challenge DB 업데이트
    const challenge = await Challenge.findOneAndUpdate(
      { challengerId, challengedId }, // 조건: challengerId와 challengedId가 일치하는 데이터
      {
        scores: { challengerScore, challengedScore },
        winnerId,
        status: "completed", // 상태를 'completed'로 업데이트
      },
      { new: true, upsert: true } // 없으면 생성 (upsert)
    );

    // 4. Friend DB 업데이트
    const updateFriendStats = async (userId, resultType) => {
      const friend = await Friend.findOne({ id: userId });
      if (!friend) {
        throw new Error(`Friend with id ${userId} not found.`);
      }

      // 결과에 따른 필드 업데이트
      if (resultType === "win") friend.win = (friend.win || 0) + 1;
      if (resultType === "lose") friend.lose = (friend.lose || 0) + 1;
      if (resultType === "draw") friend.draw = (friend.draw || 0) + 1;

      await friend.save();
    };

    // 승리/패배/무승부 로직
    if (winnerId === challengerId) {
      await updateFriendStats(challengerId, "win");
      await updateFriendStats(challengedId, "lose");
    } else if (winnerId === challengedId) {
      await updateFriendStats(challengedId, "win");
      await updateFriendStats(challengerId, "lose");
    } else {
      // 무승부
      await updateFriendStats(challengerId, "draw");
      await updateFriendStats(challengedId, "draw");
    }

    // 5. 응답 반환
    res.status(200).json({
      message: "Game result updated successfully.",
      winnerId: winnerId || "draw", // 무승부인 경우 'draw'로 표시
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating game result.",
      error: error.message,
    });
  }
});

module.exports = router;
