const mongoose = require("mongoose");

const { Schema } = mongoose;

const FriendSchema = new Schema(
  {
    friend_id: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Friend", FriendSchema);
