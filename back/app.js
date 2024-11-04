const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user'); // user 라우트 경로

const app = express();
app.use(express.json()); // JSON 요청 본문 파싱

// MongoDB 연결 설정
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB 연결 성공"))
  .catch(err => console.error("MongoDB 연결 실패:", err));

// 사용자 관련 API 라우트 등록
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중`);
});
