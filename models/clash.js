/////////////////////////////////////////////
//             Lamb API Models             //
/////////////////////////////////////////////
// Model: JSON :clash
// Ident: [:clash]
// Description: A JSON object containing data about a Clash event

module.exports = function Clash(name, date, startTime) {
	this.name = name //string
	this.date = date //string
	this.startTime = startTime //string
}
