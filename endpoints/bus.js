const https = require('https');
const ws = require('ws');
const fs = require('fs');
const colors = require('colors');

const lamb_bus = {
  init() {
    const bus_server = new ws.Server({ port: 30800 });

    // Extern server from the other websockets file
    const err = require('./errors.js');

    const config = JSON.parse(fs.readFileSync('./config.json'));
    let http_server;

    if (config.keychain_file == undefined || config.privkey_file == undefined) {
      http_server = https.createServer({
        cert: fs.readFileSync('./tls/cert.pem'),
        key: fs.readFileSync('./tls/key.pem'),
      });
      err.warn(
        "Using insecure websocket communication because keychain_file and/or privkey_file weren't specified in config.json",
        'websockets',
      );
    } else {
      http_server = https.createServer({
        cert: fs.readFileSync(config.keychain_file, 'utf8'),
        key: fs.readFileSync(config.privkey_file, 'utf8'),
      });
    }

    const broadcast_server = new ws.WebSocketServer({ server: http_server });

    broadcast_server.on('connection', (sock) => {
      console.log('Received new WSS:// connection');
      sock.send(String(JSON.stringify({
        ident: 'websockets',
        data: {
          state: 'CONNECTED',
          phase: 'waiting',
        },
      })), { binary: false });
    });

    bus_server.on('connection', (sock) => {
      sock.on('message', (data) => {
        for (const client of broadcast_server.clients) {
          if (client.readyState === ws.OPEN && client !== sock) {
            client.send(data, { binary: false });
          }
        }
      });
    });

    console.log('[/websockets]'.bold.brightMagenta, 'Initialised');
    console.log(
      '[/bus]'.bold.brightBlue,
      'Initialised LAMB internal broadcast bus',
    );

    http_server.listen(3081);
  },
};

module.exports = lamb_bus;
