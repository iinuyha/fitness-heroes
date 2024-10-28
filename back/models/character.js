const mongoose = require("mongoose");
const { Schema } = mongoose;

const CharacterSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true
    },
    character: {
      type: String,
      required: true
    },
    coin: {
      type: Number
    },
    skin: {
      type: Object
    },
    currentSkin: {
      type: String
    }
  },
  { versionKey: false }
);

module.exports = mongoose.model("Character", CharacterSchema);
