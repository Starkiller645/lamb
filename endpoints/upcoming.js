/////////////////////////////////////////////
//            Lamb API Endpoints           //
/////////////////////////////////////////////
// Endpoint: GET, POST /upcoming
// Ident: [/upcoming]
// Description: Returns a JSON list of the next 4 events that the team is participating in.
// WARN: This must be uploaded manually from Kindred.NET or a compatible client.

const fs = require('fs')
const https = require('https')
const cachefile = "./store/playercache.json"
const TeemoJS = require('teemojs')
const { ModuleFilenameHelpers } = require('webpack')
const api_key = String(fs.readFileSync("./apikey.txt")).trim()

let lol = TeemoJS(api_key)

var rq_upcoming = {
	manifestdirs: ["./team/events"],
	manifest: ["./team/events/events.json"],
	required: ["./apikey.txt"],
    update: function(req, res) {
        console.log("[/upcoming]".bold.brightBlue, "Received new data. Updating...".bold)
        if(!fs.existsSync("./team/events")) {
            fs.mkdirSync("./team/events", {recursive: true})
        }
				if(!fs.existsSync("./team/events/events.json")) {
					fs.writeFileSync("./team/events/events.json", "[]")
				}
				if(req.body.name != undefined && req.body.type != undefined && req.body.date != undefined && !isNaN(parseInt(req.body.timestamp))) {
					const event_store = "./team/events/events.json"
					var events = JSON.parse(fs.readFileSync(event_store))
					var newEvent = req.body
					newEvent["timestamp"] = parseInt(newEvent["timestamp"])
					if(events.length == 0) {
						events.push(newEvent)
					} else {
						var isDuplicate = false
						for(var i = 0, len = events.length; i < len; i++) {
							if(events[i]["timestamp"] == newEvent["timestamp"] && events[i]["name"] == newEvent["name"]) {
								isDuplicate = true
								break
							}
						}
						if(!isDuplicate) {
							events.push(newEvent)
						} else {
							console.log("[/upcoming]".bold.brightBlue, "Duplicate data, did not update".bold)
							return {code: 400, message: '{"response": 400, "err": "err_dupe_event", "message": "Duplicate event data"}'}
						}
					}
					events.sort((a, b) => {
						return b["timestamp"] - a["timestamp"]
					})
					fs.writeFileSync(event_store, JSON.stringify(events, null, 4))
					console.log("[/upcoming]".bold.brightBlue, "Done!".bold)
					return {code: 200, message: '{"response": 200, "message": "OK"}'}
				} else {
					console.log("[/upcoming]".bold.brightBlue, "Invalid data, did not update".bold)
					return {code: 400, message: '{"response": 400, "err": "err_invalid_rq", "message": "Invalid request"}'}
				}
    },		
	serve: function() {
		var stamp = Math.round(Date.now() / 1000)
		var events = JSON.parse(fs.readFileSync("./team/events/events.json"))
		var newEvents = []
		for(var i = 0; i < events.length; i++) {
			if(events[i]["timestamp"] < stamp) {
				console.log("[/upcoming]".bold.brightBlue, "Removing outdated event", events[i]["name"].bold)
			} else {
				newEvents.push(events[i])
			}
		}
		fs.writeFileSync("./team/events/events.json", JSON.stringify(newEvents, null, 4))
		return fs.readFileSync("./team/events/events.json")
	},
    serve_num: function() {
        var events = JSON.parse(fs.readFileSync("./team/events/events.json"))
        return String(events.length)
    }

}

module.exports = rq_upcoming
