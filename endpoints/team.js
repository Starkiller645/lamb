/////////////////////////////////////////////
//            Lamb API Endpoints           //
/////////////////////////////////////////////
// Endpoint: GET /team
// Ident: [/team]
// Description: Returns a list of summoner metadata entries for the whole team


const fs = require('fs')
const https = require('https')
const cachefile = "./store/playercache.json"
const configfile = "./config.json"
const colors = require('colors')
const SummonerMeta = require('../models/summoner_meta.js')

var rq_team = {
    manifestdirs: ["./team/summoners"],
    menifest: [],
    required: ["./config.json"],
    serve: function(req, res) {
        var summoners = JSON.parse(fs.readFileSync(configfile)).team_members
        var team_list = []
        for(var summoner of summoners) {
            var data = JSON.parse(fs.readFileSync("./team/summoners/" + summoner + "/metadata.json"))
            team_list.push(data)
        }
        var team_string = JSON.stringify(team_list, null, 4)
        return team_string
    },
}

module.exports = rq_team
