const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  playerEmail: {
    type: String,
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  playerName: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
