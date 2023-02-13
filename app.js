const express = require("express");

const app = express();
app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

let dataBase = null;

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const startDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  } catch (error) {
    process.exit(1);
  }
};

startDBAndServer();

//API 1 GET Method - player details
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT player_id as playerId,
                        player_name as playerName
                        FROM player_details;`;
  const playersResult = await dataBase.all(getPlayers);
  response.send(playersResult);
});

//API 2 GET Method - player details using playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const uniquePlayerDetails = `SELECT player_id as playerId,
    player_name as playerName 
    FROM player_details 
    WHERE player_id = ${playerId};`;
  const uniqueResult = await dataBase.get(uniquePlayerDetails);
  response.send(uniqueResult);
});

//API 3 PUT Method player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const queryDetails = request.body;
  const { playerName } = queryDetails;
  const updateQuery = `UPDATE player_details 
  SET 
  player_name = '${playerName}'
  WHERE player_id = ${playerId};`;
  await dataBase.run(updateQuery);
  response.send("Player Details Updated");
});

//API 4 GET Match details
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `SELECT match_id as matchId,
    match, year 
    FROM match_details
    WHERE match_id = ${matchId};`;
  const matchResult = await dataBase.get(matchDetails);
  response.send(matchResult);
});

//API 5 GET match details using player id
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const matchDetails = `SELECT match_id as matchId,
  match, year FROM player_match_score
  NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const matchUniqueResult = await dataBase.get(matchDetails);
  response.send(matchUniqueResult);
});

//API 6 GET player details using match id
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerDetails = `SELECT player_id as playerId, 
    player_name as playerName FROM player_match_score
    NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;
  const playerResult = await dataBase.all(playerDetails);
  response.send(playerResult);
});

//API 7 GET player score details using player id
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playScoreDetails = `SELECT player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes
  FROM player_match_score
  NATURAL JOIN player_details
  WHERE player_id = ${playerId};`;
  const playerScoreResult = await dataBase.get(playScoreDetails);
  response.send(playerScoreResult);
});

module.exports = app;
