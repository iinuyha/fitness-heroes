const mongoose = require("mongoose");
const { Schema } = mongoose;

const LoginSchema = new Schema(
  {
    user_id: {
      type: String,
      unique: true,
      required: true,
    },
    user_pw: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
    },
    birth: {
      type: Date,
    },
    sex: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
    },
    user_worry: {
      type: String,
    },
    character: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Login", LoginSchema);
