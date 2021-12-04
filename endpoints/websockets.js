// Technically not an endpoint, but I'll put it in here anyway

const https = require('https');
const fs = require('fs');
const ws = require('ws');
const colors = require('colors');

const config = JSON.parse(fs.readFileSync('./config.json'));

const https_server = new https.createServer({
    cert: fs.readFileSync(config["keychain_file"], 'utf8'),
    key: fs.readFileSync(config["privkey_file"], 'utf8')
})

var wss

var websocket = {
    init: () => {
        wss = new ws.WebSocketServer({
            //server: https_server
            port: 1080
        });

        console.log("[/websockets]".bold.brightMagenta, "Initialised");

        wss.on('connection', (sock) => {
            sock.send("LAMB/0.1 203 CONNECTED\nHello from the LAMB Websocket Server!")
        })

        wss.on('message', (data) => {
            console.log(data)
        })

    },
    update: (endpoint) => {
        for(var client of wss.clients) {
            if(client.readyState == ws.OPEN) {
                client.send("LAMB/0.1 201 UPDATE\n" + endpoint)
                console.log("LAMB/0.1 201 UPDATE\n" + endpoint)
            }
        }
    }
}

//https_server.listen(1080)

module.exports = websocket
