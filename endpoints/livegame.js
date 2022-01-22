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
const TeemoJS = require('teemojs')

const api_key = String(fs.readFileSync("./apikey.txt")).trim()

let lol = TeemoJS(api_key)

var rq_livegame = {
	manifest: ["./store/live/livegame.json"],
	manifestdirs: ["./store/live/"],
	required: [],
    sock: "",
    setsock: (ws) => {
        sock = ws
    },
	update: (req, res) => {
		var data = req.body
		var livegame = JSON.parse(fs.readFileSync("./store/live/livegame.json"))
        if(typeof livegame["ally"] == typeof undefined) {
            livegame["ally"] = {}
        }
        if(typeof livegame["enemy"] == typeof undefined) {
            livegame["enemy"] = {}
        }

		if(data["event"] == undefined) {
			if(data["ally"]["kills"] != undefined && data["enemy"]["kills"] != undefined) {
				livegame["ally"]["kills"] = data["ally"]["kills"]
				livegame["enemy"]["kills"] = data["enemy"]["kills"]
			}
		} else {
			if(data["event"] == "start") {
                console.log("[/live]".bold.yellow, "Live Game update:", "start".yellow)
            } else if (data["event"] == "metadata") {
                summoners = JSON.parse(fs.readFileSync("./config.json"))["team_members"]
                is_member = false
                for(var summoner of summoners) { 
                    if(summoner = data["summoner"]) is_member = true
                }
                if(!is_member) {
                    return {
                        code: 400,
                        message: "Invalid request: not a team member"
                    }
                }
                const playercache = JSON.parse(fs.readFileSync("./store/playercache.json"))
                for(var summoner of playercache) {
                    if(summoner["name"] == data["summoner"]) {
                        lol.get('euw1', 'spectator.getCurrentGameInfoBySummoner', summoner["id"])
                            .then((data) => {
                                fs.writeFileSync("./store/live/riot.json", JSON.stringify(data, null, 4))
                            })
                    }
                }
                console.log("[/live]".bold.yellow, "Live Game update:", "metadata".yellow)
                livegame["ally"]["champs"] = data["ally"]["champs"]
                livegame["ally"]["kills"] = data["ally"]["kills"]
                livegame["enemy"]["champs"] = data["enemy"]["champs"]
                livegame["enemy"]["kills"] = data["enemy"]["kills"]
                livegame["gametype"] = "LOADING"
                livegame["starttime"] = data["time"]
                livegame["client"] = data["summoner"]
			}
		}
		fs.writeFileSync("./store/live/livegame.json", JSON.stringify(livegame, null, 4))
		if(data["event"] == "end") {
            console.log("[/live]".bold.yellow, "Live Game update:", "finish".yellow)
			fs.writeFileSync("./store/live/livegame.json", "{}")
		}
        sock.update('livegame')
		return {
			code: 200,
			message: "OK"
		}
	},
	serve: (req, res) => {
		var livegame = JSON.parse(fs.readFileSync("./store/live/livegame.json"))
        var data = String(fs.readFileSync("./store/live/riot.json"))
        var riotdata = JSON.parse(data)
        gt = "LOADING"
        try {
            switch(riotdata["gameQueueConfigId"]) {
                                     case 400:
                                            gt = "SR DRAFT 5v5"
                                            break
                                        case 420:
                                            gt = "SR RANKED SOLO 5v5"
                                            break
                                        case 430:
                                            gt = "SR BLIND 5v5"
                                            break
                                        case 440:
                                            gt = "SR RANKED FLEX 5v5"
                                            break
                                        case 450:
                                            gt = "HA ARAM 5v5"
                                            break
                                        case 700:
                                            gt = "SR CLASH TOURNAMENT 5v5"
                                            break
                                        case 830:
                                            gt = "SR INTRO BOTS 5v5"
                                            break
                                        case 840:
                                            gt = "SR BEGINNER BOTS 5v5"
                                            break
                                        case 850:
                                            gt = "SR INTERMEDIATE BOTS 5v5"
                                            break
                                        default:
                                            gt = "LIMITED-TIME GAMEMODE"
                                        break
                                }
        livegame["gametype"] = gt
        return {
            code: 200,
            message: JSON.stringify(livegame, null, 4)
        }
        } catch(TypeError) {
            livegame["gametype"] = "CUSTOM"
            return {
                code: 200,
                message: JSON.stringify(livegame, null, 4)
            }
        }
	}
}

module.exports = rq_livegame
