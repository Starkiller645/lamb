/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET /recent
// Ident: [/recent]
// Description: Returns a JSON list of the last 8 games played with > 2 summoners from the team

const fs = require("fs");
const https = require("https");

const cachefile = "./store/playercache.json";
const TeemoJS = require("teemojs");
const colors = require("colors");
const Match = require("../models/match.js");
const err = require("./errors.js");

const api_key = String(fs.readFileSync("./apikey.txt")).trim();

const lol = TeemoJS(api_key);

const rq_recent = {
  manifestdirs: ["./store", "./team/summoners/"],
  manifest: ["./store/matchhist.json"],
  required: ["./apikey.txt", "./config.json"],
  refresh() {
    console.log("[/recent]".bold.cyan, "Refreshing...".bold);
    const cache = {};
    const cachefile = "./store/playercache.json";
    const summoners = JSON.parse(fs.readFileSync("./config.json")).team_members;
    const match_ids_list = [];
    const synced_match_ids = [];
    const synced_matches = [];
    const match_finals = [];

    const match_ids_promise = new Promise((resolve, reject) => {
      let temp_i = 0;
      summoners.forEach((summoner, i, arr) => {
        const summoner_dir = `./team/summoners/${summoner}`;
        if (!fs.existsSync(summoner_dir)) fs.mkdirSync(summoner_dir);
        const summoner_file = `./team/summoners/${summoner}/summoner.json`;
        const match_file = `./team/summoners/${summoner}/matchhist.json`;
        const summoner_raw = String(fs.readFileSync(summoner_file));
        const summoner_data = JSON.parse(summoner_raw);
        const { puuid } = summoner_data;

        lol
          .get("europe", "match.getMatchIdsByPUUID", puuid, { count: 20 })
          .then((data) => {
            if (data.status) {
              if (data.status.status_code == 403) {
                err.error(
                  "Failed making request to API endpoint match.getMatchIdsByPUUID with target " +
                    puuid,
                  "recent"
                );
              }
            }
            fs.writeFileSync(match_file, JSON.stringify(data));
            temp_i += 1;
            if (temp_i === arr.length) resolve();
          })
          .catch((reason) => {
            err.error(
              "Failed making request to API endpoint match.getMatchIdsByPUUID with target ",
              "recent"
            );
          });
      });
    }).then(() => {
      console.log("[/recent]".bold.cyan, "Summoner match IDs downloaded");
      summoners.forEach((summoner, i) => {
        const match_file = `./team/summoners/${summoner}/matchhist.json`;
        const match_ids = JSON.parse(fs.readFileSync(match_file));
        match_ids.forEach((id, i) => {
          if (id in match_ids_list) {
            match_ids_list[id] += 1;
          } else {
            match_ids_list[id] = 1;
          }
        });
      });

      for (const id in match_ids_list) {
        if (match_ids_list[id] >= 2) {
          synced_match_ids.push(id);
        }
      }

      const sync_promise = new Promise((resolve, reject) => {
        if (synced_match_ids.length == 0) resolve();
        synced_match_ids.forEach((id, i, arr) => {
          lol.get("europe", "match.getMatch", id).then((data) => {
            if (data) {
              synced_matches.push(data);
            }
            synced_matches.sort((a, b) => {
              return b.timestamp - a.timestamp;
            });
            if (i === arr.length - 1) resolve();
          });
        });
      });

      sync_promise.then(() => {
        console.log("[/recent]".bold.cyan, "Full match data downloaded");
        for (const match of synced_matches) {
          var allyID;
          for (const player of match.info.participants) {
            if (player.summonerName in summoners) {
              allyID = player.teamID;
              break;
            }
          }
          var enemyTeam;
          var allyTeam;
          var enemyIndex;
          var allyIndex;
          let wasDraw = false;
          const match_id = `${match.info.platformId}_${String(
            match.info.gameId
          )}`;
          if (allyID == 100) {
            allyTeam = match.info.participants.slice(0, 4);
            enemyTeam = match.info.participants.slice(-5);
            allyIndex = 0;
            enemyIndex = 1;
          } else {
            allyTeam = match.info.participants.slice(-5);
            enemyTeam = match.info.participants.slice(0, 4);
            allyIndex = 1;
            enemyIndex = 0;
          }
          const teams = { ally: allyTeam, enemy: enemyTeam };
          var won;
          if (match.info.teams[allyIndex].win == true) {
            won = true;
          } else if (match.info.teams[enemyIndex].win == true) {
            won = false;
          } else {
            won = false;
            wasDraw = true;
          }

          const playerCount = match_ids_list[match_id];
          const teamScore =
            match.info.teams[allyIndex].objectives.champion.kills;
          const enemyScore =
            match.info.teams[enemyIndex].objectives.champion.kills;
          var gameType;
          switch (match.info.queueId) {
            case 400:
              gameType = "SR Draft 5v5";
              break;
            case 420:
              gameType = "SR Ranked Solo/Duo 5v5";
              break;
            case 430:
              gameType = "SR Blind 5v5";
              break;
            case 440:
              gameType = "SR Ranked Flex 5v5";
              break;
            case 450:
              gameType = "HA ARAM 5v5";
              break;
            case 700:
              gameType = "SR Clash 5v5";
              break;
            default:
              gameType = "Limited-Time Gamemode (RTM)";
          }
          const timestamp = match.info.gameStartTimestamp;
          const temp_match = new Match(
            won,
            wasDraw,
            playerCount,
            teamScore,
            enemyScore,
            gameType,
            timestamp
          );
          match_finals.push(temp_match);
        }
        match_finals.sort((a, b) => b.timestamp - a.timestamp);
        fs.writeFileSync(
          "./store/matchhist.json",
          JSON.stringify(match_finals.slice(0, 8), 0, 4)
        );
        console.log("[/recent]".bold.cyan, "Stored all data to cache");
        console.log("[/recent]".bold.cyan, "Done!".bold);
      });
    });
  },

  serve() {
    const temp = String(fs.readFileSync("./store/matchhist.json"));
    return temp;
  },
};

module.exports = rq_recent;
