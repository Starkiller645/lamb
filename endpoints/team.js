const fs = require('fs')
const SummonerMeta = require('../models/summoner_meta.js')

const config = JSON.parse(fs.readFileSync("./config.json"))

var rq_team = {
	manifestdirs: ["./team/summoners"],
	manifest: [],
	required: ["./config.json", "./apikey.txt"],
	serve: function(req, res) {
		var team = []
		for(var summoner of config["team_members"]) {
			var data = JSON.parse(fs.readFileSync("./team/summoners/" + summoner + "/metadata.json"))
			team.push(data)
		}
		return JSON.stringify(team)
	}
}

module.exports = rq_team
