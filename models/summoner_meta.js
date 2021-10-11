/////////////////////////////////////////////
//             Lamb API Models             //
/////////////////////////////////////////////
// Model: JSON :summonerMeta
// Ident: [:summonerMeta]
// Description: A JSON object containing summoner metadata

module.exports = function SummonerMeta(name, position, rank, mains) {
	this.name = name //string
	this.position = position //string enum {"top", "jgl", "mid", "bot", "sup"}
	this.rank = rank //string
	this.mains = mains //string array
}
