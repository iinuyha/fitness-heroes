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
      required: true,
    },
    birth: {
      type: Date,
      required: true,
    },
    sex: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    user_worry: {
      type: String,
      required: true,
    },
    character: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Login", LoginSchema);
