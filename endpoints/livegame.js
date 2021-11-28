/////////////////////////////////////////////
//            Lamb API Endpoints           //
/////////////////////////////////////////////
// Endpoint: GET, POST /livegame
// Ident: [/live]
// Description: Returns data about a game in progress

const fs = require('fs')
const https = require('https')
const cachefile = "./store/playercache.json"
const Lockins = require('../models/lockins.js')
const colors = require('colors')

var rq_livegame = {
	manifest: ["./store/live/livegame.json"],
	manifestdirs: ["./store/live/"],
	required: [],
	update: (req, res) => {
		var data = req.body
		var livegame = JSON.parse(fs.readFileSync("./store/live/livegame.json"))
		if(livegame["ally"] == undefined) {
			livegame["ally"] = {}
		}
        if(livegame["enemy"] == undefined) {
            livegame["enemy"] = {}
        }
		if(data["event"] == undefined) {
			if(data["ally"] != undefined && data["enemy"] != undefined) {
				livegame["ally"]["champs"] = data["ally"]
				livegame["enemy"]["champs"] = data["enemy"]
				livegame["gametype"] = data["gametype"]
			} else if(data["allykills"] != undefined && data["enemykills"] != undefined) {
				livegame["ally"]["kills"] = data["allykills"]
				livegame["enemy"]["kills"] = data["enemykills"]
			}
		} else {
			if(data["event"] == "start") {
                console.log("[/live]".bold.yellow, "Live Game update:", "start".yellow)
				var start_time = Date.now()
				livegame["time"] = start_time;
			}
		}
		fs.writeFileSync("./store/live/livegame.json", JSON.stringify(livegame, null, 4))
		if(data["event"] == "end") {
            console.log("[/live]".bold.yellow, "Live Game update:", "finish".yellow)
			fs.writeFileSync("./store/live/livegame.json", "{}")
		}
		return {
			code: 200,
			message: "OK"
		}
	},
	serve: (req, res) => {
		var livegame = fs.readFileSync("./store/live/livegame.json")
		return {
			code: 200,
			message: livegame
		}
	}
}

module.exports = rq_livegame
