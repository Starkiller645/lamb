/////////////////////////////////////////////
//             Lamb API Models             //
/////////////////////////////////////////////
// Model: JSON :lockins
// Ident: [:lockins]
// Description: A JSON object containing a full set of either picks or bans

module.exports = function Clash(top, jgl, mid, bot, sup) {
	this.top = top //string
	this.jgl = jgl //string
	this.mid = mid //string
    this.bot = bot //string
    this.sup = sup //string
}
