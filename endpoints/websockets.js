// Technically not an endpoint, but I'll put it in here anyway

const https = require("https");
const fs = require("fs");
const ws = require("ws");
const colors = require("colors");
const err = require("./errors.js");

const config = JSON.parse(fs.readFileSync("./config.json"));

const lamb_bus = {
  broadcast(ident, payload) {
    const sock = new ws.WebSocket("ws://localhost:30800/");
    sock.on("open", () => {
      sock.send(
        JSON.stringify({
          ident: ident,
          data: payload,
        })
      );
    });
    sock.on("err", (err) => {
      throw err;
    });
  },
};

module.exports = lamb_bus;
