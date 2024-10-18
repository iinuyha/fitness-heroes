const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      unique: true,
      required: true,
    },
    story: {
      type: Number,
      required: true,
    },
    coin: {
      type: Number,
      required: true,
    },
    user_skin: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
