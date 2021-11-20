/////////////////////////////////////////////
//            Lamb API Endpoints           //
/////////////////////////////////////////////
// Endpoint: GET /pingback
// Ident: [/pingback]
// Description: Returns a simple HTTP/1.1 header indicating that the server is active

const colors = require('colors')

var rq_pingback = {
	manifestdirs: [],
	manifest: [],
	required: [],
	serve: function() {
		console.log("[/pingback]".bold.blue, "Ping request received. Returning", "HTTP/1.1 200".bold.brightGreen)
		return({pingback: "OK", code: "200", message: "OK"})	

	}
}

module.exports = rq_pingback
