const router = require("express").Router();
const fetchUser = require("../middlewares/fetchUser");
const { addScore, getScores } = require("../controllers/leaderboardController");

router.post("/addscore", fetchUser, addScore);
router.get("/getscores", getScores);

module.exports = router;
