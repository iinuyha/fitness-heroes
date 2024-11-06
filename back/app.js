var express = require("express");
const connectDB = require("./config/db");
const cors = require("cors"); // CORS 패키지 추가

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var protectedRouter = require("./routes/protectedRouter");
var loginRouter = require("./routes/loginRouter");
var signupRouter = require("./routes/signupRouter");
var sendEmailRouter = require("./routes/sendEmailRouter");
var characterRouter = require("./routes/characterRouter");
var userRouter = require("./routes/userRouter");
var storyRouter = require("./routes/storyRouter");
var exerciseRouter = require("./routes/exerciseRouter");
var friendRouter = require("./routes/friendRouter");

var app = express();

app.use(cors());

connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", protectedRouter);
app.use("/api/sendEmail", sendEmailRouter);
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/character", characterRouter);
app.use("/api/user", userRouter);
app.use("/api/story", storyRouter);
app.use("/api/exercise", exerciseRouter);
app.use("/api/friend", friendRouter);

module.exports = app;
