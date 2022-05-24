/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET /nextclash
// Ident: [/nextclash]
// Description: Returns a JSON Clash object detailing only the next or current (current pref.) clash

const fs = require("fs");
const https = require("https");

const cachefile = "./store/playercache.json";
const TeemoJS = require("teemojs");
const colors = require("colors");
const Clash = require("../models/clash.js");
const err = require("./errors.js");

const api_key = String(fs.readFileSync("./apikey.txt")).trim();

const lol = TeemoJS(api_key);

const rq_nextclash = {
  manifestdirs: ["./store"],
  manifest: ["./store/nextclash.json"],
  required: ["./apikey.txt"],
  refresh() {
    console.log("[/nextclash]".bold.cyan, "Refreshing...".bold);
    lol
      .get("euw1", "clash.getTournaments")
      .then((data) => {
        const clash = data;
        const nextclash = data[0];
        if (typeof nextclash === typeof undefined) {
          if (!fs.existsSync("./store/nextclash.json"))
            fs.writeFileSync("./store/nextclash.json", "{}");
          console.log(
            "[/nextclash]".bold.cyan,
            "No available data, did not update"
          );
          return;
        }

        let name = nextclash.nameKey;
        name = name[0].toUpperCase() + name.slice(1);

        const date = new Date();
        date.setTime(nextclash.schedule[0].startTime);
        const dateString = `${String(date.getDate())}/${String(
          date.getMonth() + 1
        )}`;

        const time = new Date();
        time.setTime(nextclash.schedule[0].registrationTime);
        const timeString = `${`${String(time.getHours())}0`.slice(
          0,
          2
        )}:${`${String(time.getMinutes())}0`.slice(0, 2)}:${`${String(
          time.getSeconds()
        )}0`.slice(0, 2)}`;

        const clashData = new Clash(name, dateString, timeString);

        fs.writeFileSync(
          "./store/nextclash.json",
          JSON.stringify(clashData, null, 4)
        );

        console.log("[/nextclash]".bold.cyan, "Done!".bold);
      })
      .catch((err) => {
        err.error(
          "Failed making a request to API endpoint clash.getTournaments",
          "nextclash"
        );
      });
  },

  serve(req, res) {
    const nextClash = String(fs.readFileSync("./store/nextclash.json"));
    return nextClash;
  },
};
module.exports = rq_nextclash;
