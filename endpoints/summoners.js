/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET, POST /summoners/:summoner
// Ident: [/summoners]
// Description: Returns or sets summoner metadata for the team
// Params: {
//		summoner: The name of the summoner to set (POST)
// }

const fs = require('fs');
const https = require('https');

const cachefile = './store/playercache.json';
const TeemoJS = require('teemojs');
const colors = require('colors');
const SummonerMeta = require('../models/summoner_meta.js');

const api_key = String(fs.readFileSync('./apikey.txt')).trim();

const lol = TeemoJS(api_key);

const rq_summoners = {
  manifestdirs: ['./team/summoners'],
  manifest: [],
  required: ['./config.json', './apikey.txt'],
  update(req, res, summoner) {
    console.log('[/summoners]'.bold.brightBlue, 'Received new data. Updating...'.bold);

    const data = req.body;
    const summoners = JSON.parse(fs.readFileSync('./config.json')).team_members;
    const summoner_name = req.params.summoner;
    if (!summoners.includes(summoner_name)) return { code: 400, message: '{"response": 400, "err": "err_summoner_not_found", "message": "Summoner not found"}' };

    if (!fs.existsSync(`./team/summoners/${summoner_name}/metadata.json`)) {
      fs.writeFileSync(`./team/summoners/${summoner_name}/metadata.json`, '{}');
    }

    const summonerMeta = JSON.parse(fs.readFileSync(`./team/summoners/${summoner_name}/metadata.json`));

    if (data.name !== typeof undefined && data.position !== typeof undefined && data.mains !== typeof undefined) {
      if (!['top', 'jgl', 'mid', 'bot', 'sup'].includes(data.position)) return { code: 400, message: '{"response": 400, "err": "err_invalid_param", "message": "Invalid value for position"}' };
      let rank;
      if (JSON.parse(fs.readFileSync(`./team/summoners/${summoner_name}/metadata.json`)).rank !== typeof undefined) {
        rank = 'Unranked';
      } else {
        rank = JSON.parse(fs.readFileSync(`./team/summoners/${summoner_name}/metadata.json`)).rank;
      }
      const summonerObject = new SummonerMeta(data.name, data.position, rank, data.mains);
      fs.writeFileSync(`./team/summoners/${summoner_name}/metadata.json`, JSON.stringify(summonerObject, null, 4));
      console.log('[/summoners]'.bold.brightBlue, 'Done!'.bold);
      return { code: 200, message: '{"response": 200, "message": "OK"}' };
    }
    console.log('[/summoners]'.bold.brightBlue, 'Missing values, did not update!'.bold);
    return { code: 400, message: '{"response": 400, "err": "err_missing_values", "message": "Request missing values"}' };
  },

  refresh() {
    console.log('[/summoners]'.bold.cyan, 'Refreshing...'.bold);
    const summoners = JSON.parse(fs.readFileSync('./config.json')).team_members;
    const summoner_league_promise = new Promise((resolve, reject) => {
      let iter = 0;
      summoners.forEach((summoner, i) => {
        if (!fs.existsSync(`./team/summoners/${summoner}/metadata.json`)) fs.writeFileSync(`./team/summoners/${summoner}/metadata.json`, '{}');
        const summoner_data = JSON.parse(fs.readFileSync(`./team/summoners/${summoner}/metadata.json`));
        const summoner_id = JSON.parse(fs.readFileSync(`./team/summoners/${summoner}/summoner.json`)).id;
        lol.get('euw1', 'league.getLeagueEntriesForSummoner', summoner_id).then((data) => {
          try {
            const division = data[0].tier.slice(0, 1).toUpperCase() + data[0].tier.slice(1).toLowerCase();
            var rank = `${division} ${data[0].rank}`;
          } catch (err) {
            var rank = 'Unranked';
          }
          summoner_data.rank = rank;
          fs.writeFileSync(`./team/summoners/${summoner}/metadata.json`, JSON.stringify(summoner_data, null, 4));
        });
        iter += 1;
        if (iter === summoners.length - 1) resolve();
      });
    });
    summoner_league_promise.then(() => {
      console.log('[/summoners]'.bold.cyan, 'Done!'.bold);
    });
  },
  serve(req, res) {
    const { summoner } = req.params;
    const temp = String(fs.readFileSync(`./team/summoners/${summoner}/metadata.json`));
    return temp;
  },
};

module.exports = rq_summoners;
