const fs = require('fs');
const SummonerMeta = require('../models/summoner_meta.js');

const config = JSON.parse(fs.readFileSync('./config.json'));

const rq_team = {
  manifestdirs: ['./team/summoners'],
  manifest: [],
  required: ['./config.json', './apikey.txt'],
  serve(req, res) {
    const team = [];
    for (const summoner of config.team_members) {
      const data = JSON.parse(fs.readFileSync(`./team/summoners/${summoner}/metadata.json`));
      team.push(data);
    }
    return JSON.stringify(team);
  },
};

module.exports = rq_team;
