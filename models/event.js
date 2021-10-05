/////////////////////////////////////////////
//             Lamb API Models             //
/////////////////////////////////////////////
// Model: JSON :event
// Ident: [:event]
// Description: A JSON object containing one (1) upcoming event

module.exports = function Event(name, type, date) {
    this.name = name //string
    this.type = type //string enum {"clash", "tourney", "training"}
    this.date = date //string
}
