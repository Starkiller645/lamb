// Technically not an endpoint, but I'll put it in here anyway

const https = require("https");
const fs = require("fs");
const ws = require("ws");
const colors = require("colors");

const err = require("./errors.js");

const config = JSON.parse(fs.readFileSync("./config.json"));
var http_server = undefined;

if (config.keychain_file == undefined || config.privkey_file == undefined) {
  http_server = https.createServer({
    cert: fs.readFileSync("./tls/cert.pem"),
    key: fs.readFileSync("./tls/key.pem"),
  });
  err.warn(
    "Using insecure websocket communication because keychain_file and/or privkey_file weren't specified in config.json",
    "websockets"
  );
} else {
  http_server = https.createServer({
    cert: fs.readFileSync(config.keychain_file, "utf8"),
    key: fs.readFileSync(config.privkey_file, "utf8"),
  });
}

const wss = new ws.Server({ server: http_server });
//const wss = new ws.WebSocketServer({ port: 3082 });

console.log("[/websockets]".bold.brightMagenta, "Initialised");

const lamb_bus = {
  sendupdate(ident, payload) {
    for (var client of wss.clients) {
      if (client.readyState === ws.OPEN) {
        client.send(
          JSON.stringify(
            {
              ident: ident,
              data: payload,
            },
            4
          )
        );
      }
    }
  },
};

wss.on("connection", (sock) => {
  sock.on("message", (data) => {
    console.log("received %s", data);
  });
  sock.send("Never one...");
  sock.on("error", (err) => {
    console.log(err);
  });
});

http_server.listen(3081);

module.exports = lamb_bus;
