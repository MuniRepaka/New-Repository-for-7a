const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertingDBObjTOResponseObj = (DBObject) => {
  return {
    playerId: DBObject.player_id,
    playerName: DBObject.player_name,
    matchId: DBObject.match_id,
    match: DBObject.match,
    year: DBObject.year,
    playerMatchId: DBObject.player_match_id,
    playerId: DBObject.player_id,
    matchId: DBObject.match_id,
    score: DBObject.score,
    fours: DBObject.fours,
    sixes: DBObject.sixes,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayerDetailsQuery = `
    SELECT
    *
    FROM
    player_details;`;
  const playersArray = await db.all(getPlayerDetailsQuery);
  response.send(
    playersArray.map((eachElement) => {
      return convertingDBObjTOResponseObj(eachElement);
    })
  );
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlaterDetailsQuery = `
    SELECT
    *
    FROM
    player_details
    WHERE
    player_id = ${playerId};`;
  const playerArray = await db.get(getPlaterDetailsQuery);
  response.send(convertingDBObjTOResponseObj(playerArray));
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetailsQuery = `
    UPDATE
    player_details
    SET
    player_name='${playerName}'
    WHERE
    player_id=${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT
    *
    FROM
    match_details
    WHERE
    match_id=${matchId};`;
  const matchArray = await db.get(getMatchDetailsQuery);
  response.send(
    matchArray.map((eachElement) => {
      return convertingDBObjTOResponseObj(eachElement);
    })
  );
});

//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesOfPlayerQuery = `
    SELECT
    match_id AS matchId,
    match,
    year
    FROM
    match_details NATURAL JOIN player_match_score
    WHERE
    player_id = ${playerId};`;
  const matchesArray = await db.all(getMatchesOfPlayerQuery);
  response.send(matchesArray);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersInAMatchQuery = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM
    player_details NATURAL JOIN player_match_score
    WHERE
    match_id = ${matchId};`;
  const playerArray = await db.all(getPlayersInAMatchQuery);
  response.send(playerArray);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStatQuery = `
  SELECT
  player_id AS playerId,
  player_name AS playerName,
  SUM(score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM
  player_details NATURAL JOIN player_match_score
  WHERE
  player_id = ${playerId};`;
  const playerStat = await db.get(getPlayerStatQuery);
  response.send(playerStat);
});

module.exports = app;
