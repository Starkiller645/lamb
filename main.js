// Main script/entry point for Lamb API Program

var express = require('express');
const express_app = express();
var rq_recent = require('./endpoints/recent.js');
var rq_upcoming = require('./endpoints/upcoming.js');
var rq_nextclash = require('./endpoints/nextclash.js');
const fs = require('fs')
const TeemoJS = require('teemojs')
const api_key = String(fs.readFileSync("./apikey.txt")).trim()
const colors = require('colors')
let lol = TeemoJS(api_key)

console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓")
console.log("┃ Welcome to".bold, "LAMB".bold.yellow, "v1.0 - the", "Wolf Online League Feed".bold, "backend                     ┃")
console.log("┃", "WOLF".bold.yellow, "is free software licensed under", "GPLv3".bold, "                                    ┃")
console.log("┃ Source code is available @", "https://git.jacobtye.dev/Starkiller645/wolf-backend".bold.cyan, "┃")
console.log("┃ WOLF was created by", "Jacob Tye".bold.yellow, "@", "https://jacobtye.dev".bold.cyan, "                          ┃")
console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n")

express_app.use(express.json())

// Endpoint routing values

express_app.get('/nextclash', (req, res) => {
	res.send(rq_nextclash.serve())
})

express_app.get('/recent', function(req, res, next) {
  res.send(rq_recent.serve())
})

express_app.post('/upcoming', (req, res) => {
	serve = rq_upcoming.update(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
})

express_app.get('/upcoming', (req, res) => {
  res.send(rq_upcoming.serve())
})

const cachefile = "./store/playercache.json"
var summoners = JSON.parse(fs.readFileSync("./config.json"))["team_members"]
let summoners_data = []

if(!fs.existsSync(cachefile)) {
  console.log("Cachefile not found, forcing cache rebuild...")
  fs.writeFileSync('./store/playercache.json', '[]')
  summoners.forEach((summoner, i) => {
    let summoner_dir = './team/summoners/' + summoner
    let summoner_file = summoner_dir + "/summoner.json"
    if(!fs.existsSync(summoner_dir)) {
      fs.mkdirSync(summoner_dir, {recursive: true})
    }
    lol.get('euw1', 'summoner.getBySummonerName', summoner)
    .then(function (data) {

      let cacheJson = fs.readFileSync('./store/playercache.json')
      let players = JSON.parse(cacheJson)
      players.push(data)
      cacheJson = JSON.stringify(players)
      fs.writeFileSync(cachefile, cacheJson)
      console.log(i, summoner)
      if(!fs.existsSync(summoner_dir)) {
        fs.mkdirSync(summoner_dir, {recursive: true})
      }
      fs.writeFileSync(summoner_file, JSON.stringify(data, 4))
    })
    .catch()
  });
}

function setup_timers() {
  // Execute all refreshes once
  rq_recent.refresh()
	rq_nextclash.refresh()

  // Set interval for future updates
  setInterval(rq_recent.refresh, 60000)
	setInterval(rq_nextclash.refresh, 1800000)
}

setup_timers()
express_app.listen(3080, () => console.log("[/main]".bold.magenta, "Listening on port", "3080".magenta))
