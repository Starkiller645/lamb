/////////////////////////////////////////////
//            Lamb API Endpoints           //
/////////////////////////////////////////////
// Endpoint: GET /nextclash
// Ident: [/nextclash]
// Description: Returns a JSON Clash object detailing only the next or current (current pref.) clash

const fs = require('fs')
const https = require('https')
const cachefile = "./store/playercache.json"
const TeemoJS = require('teemojs')
const Clash = require('../models/clash.js')
const colors = require('colors')

const api_key = String(fs.readFileSync("./apikey.txt")).trim()

let lol = TeemoJS(api_key)

var rq_nextclash = {
	manifestdirs: ["./store"],
	manifest: ["./store/nextclash.json"],
	required: ["./apikey.txt"],
	refresh: function() {
		console.log("[/nextclash]".bold.cyan, "Refreshing...".bold) 
		lol.get("euw1", "clash.getTournaments").then((data) => {
			var clash = data
			var nextclash = data[0]

			var name = nextclash["nameKey"]
			name = name[0].toUpperCase() + name.slice(1)

			var date = new Date()
			date.setTime(nextclash["schedule"][0]["startTime"])
			var dateString = String(date.getDate()) + "/" + String(date.getMonth() + 1)

			var time = new Date()
			time.setTime(nextclash["schedule"][0]["registrationTime"])
			var timeString = (String(time.getHours()) + "0").slice(0, 2) + ":" + (String(time.getMinutes()) + "0").slice(0, 2) + ":" + (String(time.getSeconds()) + "0").slice(0, 2)

			var clashData = new Clash(name, dateString, timeString)

			fs.writeFileSync("./store/nextclash.json", JSON.stringify(clashData, null, 4))

			console.log("[/nextclash]".bold.cyan, "Done!".bold)
		})
	},

	serve: function(req, res) {
		var nextClash = String(fs.readFileSync("./store/nextclash.json"))
		return nextClash
	}
}
module.exports = rq_nextclash
