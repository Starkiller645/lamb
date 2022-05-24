/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET, POST /livegame
// Ident: [/live]
// Description: Returns data about a game in progress

const fs = require('fs');
const https = require('https');

const cachefile = './store/playercache.json';
const colors = require('colors');
const Lockins = require('../models/lockins.js');

const rq_livegame = {
  manifest: ['./store/live/livegame.json'],
  manifestdirs: ['./store/live/'],
  required: [],
  update: (req, res) => {
    const data = req.body;
    const livegame = JSON.parse(fs.readFileSync('./store/live/livegame.json'));
    if (livegame.ally == undefined) {
      livegame.ally = {};
    }
	        if (livegame.enemy == undefined) {
        		livegame.enemy = {};
	        }
    if (data.event == 'metadata') {
      console.log('[/live]'.bold.yellow, 'Live Game update:', 'metadata'.yellow);
      livegame.ally.champs = data.ally.champs;
      livegame.enemy.champs = data.enemy.champs;
      livegame.ally.kills = 0;
      livegame.enemy.kills = 0;
      livegame.gametype = 'NO DATA';
      const start_time = parseInt(data.time);
      livegame.starttime = start_time * 1000;
    }
    if (data.event == 'start') {
      console.log('[/live]'.bold.yellow, 'Live Game update:', 'start'.yellow);
    }
    if (data.event == 'update') {
      livegame.ally.kills = data.ally.kills;
      livegame.enemy.kills = data.enemy.kills;
    }
    fs.writeFileSync('./store/live/livegame.json', JSON.stringify(livegame, null, 4));
    if (data.event == 'end') {
	                console.log('[/live]'.bold.yellow, 'Live Game update:', 'finish'.yellow);
      fs.writeFileSync('./store/live/livegame.json', '{}');
    }
    return {
      code: 200,
      message: 'OK',
    };
  },
  serve: (req, res) => {
    const livegame = fs.readFileSync('./store/live/livegame.json');
    return {
      code: 200,
      message: livegame,
    };
  },
};

module.exports = rq_livegame;
