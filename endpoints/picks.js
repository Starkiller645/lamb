/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET,POST /picks
// Ident: [/picks]
// Description: Returns a JSON Lockins object referring to picks

const fs = require("fs");
const https = require("https");

const cachefile = "./store/playercache.json";
const colors = require("colors");
const Lockins = require("../models/lockins.js");
const bus = require("../endpoints/websockets.js");

const rq_picks = {
  manifestdirs: ["./store"],
  manifest: ["./store/picks.json"],
  required: [],
  update(req, res) {
    console.log(
      "[/picks]".bold.brightBlue,
      "Received new data. Updating...".bold
    );
    if (
      req.body.top != undefined &&
      req.body.jgl != undefined &&
      req.body.mid != undefined &&
      req.body.bot != undefined &&
      req.body.sup != undefined
    ) {
      fs.writeFileSync("./store/picks.json", JSON.stringify(req.body, null, 4));
      console.log("[/picks]".bold.brightBlue, "Done!".bold);
      bus.broadcast("picks", req.body);
      return { code: 200, message: '{"response": 200, "message": "OK"}' };
    }
    console.log(
      "[/picks]".bold.brightBlue,
      "Invalid data, did not update".bold
    );
    return {
      code: 400,
      message:
        '{"response": 400, "err": "err_invalid_rq", "message": "Invalid request"}',
    };
  },
  serve(req, res) {
    data = String(fs.readFileSync("./store/picks.json"));
    return data;
  },
};

module.exports = rq_picks;
