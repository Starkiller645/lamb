/////////////////////////////////////////////
//             Lamb API Models             //
/////////////////////////////////////////////
// Model: JSON :match
// Ident: [:match]
// Description: A JSON object containing one (1) League match

module.exports = function Match(won, wasDraw, playerCount, teamScore, enemyScore, gameType, timestamp) {
  this.won = won //bool
  this.wasDraw = wasDraw //bool
  this.playerCount = playerCount //int
  this.teamScore = teamScore //int
  this.enemyScore = enemyScore //int
  this.gameType = gameType //string
  this.timestamp = timestamp //int
}
