// Technically not an endpoint, but I'll put it in here anyway

const https = require('https');
const fs = require('fs');
const ws = require('ws');
const colors = require('colors');

const config = JSON.parse(fs.readFileSync('./config.json'));

const wss = ws.createServer({
	cert: fs.readFileSync(config["keychain_file"], 'utf8'),
	key: fs.readFileSync(config["privkey_file"], 'utf8')
});

const ws_local = ws.createServer();

console.log("[/websockets]".bold.brightMagenta, "Initialised");


