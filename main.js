// Main script/entry point for Lamb API Program
var express = require('express');
const express_app = express();
var rq_recent = require('./endpoints/recent.js');
var rq_upcoming = require('./endpoints/upcoming.js');
var rq_nextclash = require('./endpoints/nextclash.js');
var rq_summoners = require('./endpoints/summoners.js');
var rq_bans = require('./endpoints/bans.js');
var rq_picks = require('./endpoints/picks.js');
var rq_pingback = require('./endpoints/pingback.js');
var rq_team = require('./endpoints/team.js');
var rq_livegame = require('./endpoints/livegame.js')
var websocket = require('./endpoints/websockets.js')
const bodyparser = require('body-parser')
var urlencode = bodyparser.urlencoded({extended: false})
const fs = require('fs')

const colors = require('colors')
console.log('\033[2J');

console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓")
console.log("┃ Welcome to".bold, "LAMB".bold.yellow, "v0.1 - the", "Wolf Online League Feed".bold, "backend                     ┃")
console.log("┃", "WOLF".bold.yellow, "is free software licensed under", "GPLv3".bold, "                                    ┃")
console.log("┃ Source code is available @", "https://git.jacobtye.dev/Starkiller645/wolf-backend".bold.cyan, "┃")
console.log("┃ WOLF was created by", "Jacob Tye".bold.yellow, "@", "https://jacobtye.dev".bold.cyan, "                          ┃")
console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n")

websocket.init()

express_app.use(express.json())

// Endpoint routing values

rq_livegame.setsock(websocket)
rq_nextclash.setsock(websocket)
rq_recent.setsock(websocket)

express_app.get('/livegame', (req, res) => {
	serve = rq_livegame.serve(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
})

express_app.post('/livegame', (req, res) => {
	serve = rq_livegame.update(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
    websocket.update('livegame')
})

express_app.post('/bans', (req, res) => {
	serve = rq_bans.update(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
    websocket.update('bans')
}
)

express_app.get('/team', (req, res) => {
	res.send(rq_team.serve(req, res))
})

express_app.get('/bans', (req, res) => {
	res.send(rq_bans.serve(req, res))
})

express_app.post('/picks', (req, res) => {
	serve = rq_picks.update(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
    websocket.update('picks')
}
)

express_app.get('/picks', (req, res) => {
	res.send(rq_picks.serve(req, res))
})

express_app.get('/summoners/:summoner', urlencode, (req, res) => {
	res.send(rq_summoners.serve(req, res))	
})
express_app.post('/summoners/:summoner', urlencode, (req, res) => {
	serve = rq_summoners.update(req, res)
	res.status(serve["code"])
	res.set("Content-Type", "application/json")
	res.send(serve["message"])
    websocket.update('summoners')
    websocket.update('team')
})

express_app.get('/nextclash', (req, res) => {
	res.send(rq_nextclash.serve())
})

express_app.get('/recent', function(req, res, next) {
  res.send(rq_recent.serve())
})

express_app.get('/pingback', (req, res) => {
	serve = rq_pingback.serve()
	res.status(serve["code"])
	res.send(serve["message"])
})

express_app.post('/upcoming', (req, res) => {
	serve = rq_upcoming.update(req, res)
	res.status(serve["code"])
	res.send(serve["message"])
    websocket.update('upcoming')
})

express_app.get('/upcoming', (req, res) => {
  res.set("Content-Type", "application/json")
  res.send(rq_upcoming.serve())
})

express_app.get('/num_events', (req, res) => {
    res.status(200)
    res.send(rq_upcoming.serve_num())
})

express_app.get('/team', (req, res) => {
    var serve = rq_team.serve()
    res.status(serve.code["code"])
    res.send(serve.message["message"])
})

const cachefile = "./store/playercache.json"
var summoners = JSON.parse(fs.readFileSync("./config.json"))["team_members"]
let summoners_data = []
const manifest_list = [rq_recent.manifest, rq_upcoming.manifest, rq_nextclash.manifest, rq_summoners.manifest, rq_bans.manifest, rq_picks.manifest, rq_livegame.manifest]
let manifest = [].concat(...manifest_list)
const manifest_dirs_list = [rq_recent.manifestdirs, rq_upcoming.manifestdirs, rq_nextclash.manifestdirs, rq_summoners.manifestdirs, rq_bans.manifestdirs, rq_picks.manifestdirs, rq_livegame.manifestdirs]
let manifestdirs = [].concat(...manifest_dirs_list)
const required_list = [rq_recent.required, rq_upcoming.required, rq_nextclash.required, rq_summoners.required, rq_bans.required, rq_picks.required, rq_livegame.required]
let required = [].concat(...required_list)

function check_manifest() {
	console.log("[/manifest]".bold.green, "Starting manifest checks")
	manifest = manifest.filter((item, index, arr) => {
		return arr.indexOf(item) == index
	})
	manifestdirs = manifestdirs.filter((item, index, arr) => {
		return arr.indexOf(item) == index
	})
	required = required.filter((item, index, arr) => {
		return arr.indexOf(item) == index
	})

	for(var item of manifestdirs) {
		if(!fs.existsSync(item)) fs.mkdirSync(item, {recursive: true})
		console.log("[/manifest]".bold.green, "Creating directory", item)
	}
	for(var item of manifest) {
		if(!fs.existsSync(item)) fs.writeFileSync(item, "{}")
	}
	for(var item of required) {
		if(!fs.existsSync(item)) console.err("[err]".bold.red, "Could not find required file: \"" + item + "\"")
	}
	console.log("[/manifest]".bold.green, "Manifest check complete.")
}

function clear_cache() {
	// This functions checks for old summoners and removes them from the cache
	// Runs once at the start of the program
	if(fs.existsSync("./team/summoners")) {
		var summoner_cache = fs.readdirSync("./team/summoners/")
	} else {
		console.err("[/cachecheck]".bold.grey, "Error".bold.red + "couldn't find summoners directory")
		return false
	}
	var summoners = JSON.parse(fs.readFileSync("./config.json"))["team_members"]
	var cache_invalid = false
	for(var summoner of summoners) {
		if(!summoner_cache.includes(summoner)) {
			cache_invalid = true
		}
	}
	for(var summoner of summoner_cache) {
		if(!summoners.includes(summoner)) {
			fs.rmSync("./team/summoners/" + summoner, { recursive: true, force: true })
		}
	}
	if(cache_invalid) {
		if(fs.existsSync("./store/playercache.json")) fs.rmSync("./store/playercache.json")
		console.log("[/cachecheck]".grey.bold, "Cache invalid, forcing rebuild")
	} else {
		console.log("[/cachecheck]".grey.bold, "Cache valid, continuing")
	}
}

function setup_timers() {
  // Execute all refreshes once
  rq_recent.refresh()
	rq_nextclash.refresh()
	rq_summoners.refresh()

  // Set interval for future updates
  setInterval(rq_recent.refresh, 180000)
	setInterval(rq_nextclash.refresh, 1800000)
	setInterval(rq_summoners.refresh, 180000)
}
check_manifest()

const TeemoJS = require('teemojs')
const api_key = String(fs.readFileSync("./apikey.txt")).trim()
let lol = TeemoJS(api_key)
function rebuild_cache(resolve, reject) {
	if(!fs.existsSync(cachefile)) {
		console.log("[/cachecheck]".bold.grey, "Cachefile not found, forcing cache rebuild...")
		fs.writeFileSync('./store/playercache.json', '[]')
		var temp_i = 0
		for(var summoner of summoners) {
			let summoner_dir = './team/summoners/' + summoner
			let summoner_file = summoner_dir + "/summoner.json"
			if(!fs.existsSync(summoner_dir)) fs.mkdirSync(summoner_dir, {recursive: true})
				lol.get('euw1', 'summoner.getBySummonerName', summoner)
				.then((data) => {
					let cacheJson = fs.readFileSync('./store/playercache.json')
					let players = JSON.parse(cacheJson)
					players.push(data)
					cacheJson = JSON.stringify(players)
					fs.writeFileSync(cachefile, cacheJson)
					if(!fs.existsSync(summoner_dir)) fs.mkdirSync(summoner_dir, {recursive: true})
					fs.writeFileSync(summoner_file, JSON.stringify(data, null, 4))
					temp_i += 1
					if(temp_i === summoners.length) {
						console.log("[/cachecheck]".bold.grey, "All summoner data downloaded")
						resolve()
					}
					})
			}
		} else {
			console.log("[/cachecheck]".bold.grey, "Cache OK, continuing")
			resolve()
		}
	}

console.log("[/cachecheck]".bold.grey, "Checking cache")
clear_cache()
var cache_cleared_promise = new Promise(rebuild_cache)

cache_cleared_promise.then(() => {
	console.log("[/cachecheck]".bold.grey, "Finished checking cache")
	setup_timers()
	express_app.listen(3080, () => console.log("[/main]".bold.magenta, "Listening on port", "3080".magenta))
})
