const ws = require('ws')
const colors = require('colors')

const sock = new ws.WebSocket('ws://localhost:1080')

sock.on('open', () => {
	ws.send("LAMB/0.1 202 CLIENT")
})

sock.on('message', (data) => {
	var message = data.split("\n")
	console.log(message[0].bold.green)
	console.log(message[1])
})
