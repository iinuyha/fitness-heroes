const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  challengerId: {
    type: String,
    ref: "User",
    required: true,
  }, // 대결을 신청한 사용자 ID
  challengedId: {
    type: String,
    ref: "User",
    required: true,
  }, // 대결을 받은 사용자 ID
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "completed"],
    default: "pending",
  }, // 대결 상태 (진행 중, 수락됨, 거절됨, 완료됨)
  winnerId: {
    type: String,
    ref: "User",
  }, // 대결에서 승리한 사용자 ID
  createdAt: {
    type: Date,
    default: Date.now,
  }, // 대결 신청 날짜
  acceptedAt: {
    type: Date,
  }, // 대결 수락 날짜
  completedAt: {
    type: Date,
  }, // 대결 완료 날짜
  scores: {
    challengerScore: { type: Number, default: 0 }, // 신청자 점수
    challengedScore: { type: Number, default: 0 }, // 수락자 점수
  },
});

module.exports = mongoose.model("Challenge", challengeSchema, "Challenge");
