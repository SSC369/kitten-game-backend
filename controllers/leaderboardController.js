const Leaderboard = require("../models/leaderboardModel");
const { v4 } = require("uuid");

// Array to store connected WebSocket clients
let clients = [];
console.log(clients);

// Function to broadcast leaderboard updates to connected clients
const broadcastLeaderboardUpdate = async () => {
  try {
    // Retrieve scores from the leaderboard
    const scores = await Leaderboard.find();
    // Sort scores
    scores.sort((a, b) => {
      // Sort by score in descending order
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // If scores are equal, sort by time in ascending order
      return new Date(a.time) - new Date(b.time);
    });
    const leaderboard = scores.map((s) => {
      const { playerEmail, score, playerName } = s;
      return {
        playerEmail,
        score,
        playerName,
      };
    });

    // Broadcast leaderboard update to all connected clients
    clients.forEach((client) => {
      client.emit("leaderboardUpdate", leaderboard);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.addScore = async (req, res) => {
  try {
    const { username, email } = req.user.userDetails;
    const findPlayer = await Leaderboard.findOne({ playerEmail: email });
    if (findPlayer) {
      await Leaderboard.updateOne(
        { playerEmail: email },
        {
          $set: {
            score: findPlayer.score + 1,
            time: new Date(),
          },
        }
      );
    } else {
      await Leaderboard.create({
        playerName: username,
        playerEmail: email,
        time: new Date(),
        score: 1,
      });
    }

    // After updating the score, broadcast leaderboard update to all connected clients
    await broadcastLeaderboardUpdate();

    return res.status(201).json({ status: true, msg: "Congratulations :)" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, msg: "Server issue :(" });
  }
};

module.exports.getScores = async (req, res) => {
  try {
    // Retrieve scores from the leaderboard
    const scores = await Leaderboard.find();

    // Sort scores
    scores.sort((a, b) => {
      // Sort by score in descending order
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // If scores are equal, sort by time in ascending order
      return new Date(a.time) - new Date(b.time);
    });
    const leaderboard = scores.map((s) => {
      const { playerEmail, score, playerName } = s;
      return {
        playerEmail,
        score,
        playerName,
      };
    });

    return res.status(200).json({ status: 200, leaderboard });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, msg: "Server issue :(" });
  }
};

// WebSocket connection handler
module.exports.handleWebSocketConnection = (io) => {
  io.on("connection", (socket) => {
    // Add the client to the clients array
    clients.push(socket);

    // Remove the client from the clients array on disconnect
    socket.on("disconnect", (c) => {
      const index = clients.indexOf(socket);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });
};
