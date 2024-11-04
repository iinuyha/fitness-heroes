<<<<<<< HEAD
var express = require("express");
const connectDB = require("./config/db");
const cors = require("cors"); // CORS 패키지 추가
=======
// var express = require('express');
// const connectDB = require('./config/db');
// const cors = require('cors'); // CORS 패키지 추가
>>>>>>> 2d6baea (?signup,login?)

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

<<<<<<< HEAD
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var sendEmailRouter = require("./routes/sendEmailRouter");
var characterRouter = require("./routes/characterRouter");
=======
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var sendEmailRouter = require('./routes/sendEmailRouter');
>>>>>>> 2d6baea (?signup,login?)

// var app = express();

// app.use(cors());

// connectDB();

<<<<<<< HEAD
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/sendEmail", sendEmailRouter);
app.use("/api/character", characterRouter);
=======
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/api', sendEmailRouter);
>>>>>>> 2d6baea (?signup,login?)

// module.exports = app;

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
