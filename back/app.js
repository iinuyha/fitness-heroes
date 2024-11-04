var express = require("express");
const connectDB = require("./config/db");
const cors = require("cors"); // CORS 패키지 추가

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var signupRouter = require("./routes/signupRouter");
var sendEmailRouter = require("./routes/sendEmailRouter");
var characterRouter = require("./routes/characterRouter");

var app = express();

app.use(cors());

connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/sendEmail", sendEmailRouter);
app.use("/api/signup", signupRouter);
app.use("/api/character", characterRouter);

module.exports = app;
