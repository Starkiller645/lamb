/// //////////////////////////////////////////
//            Lamb API Endpoints           //
/// //////////////////////////////////////////
// Endpoint: GET /bans
// Ident: [/bans]
// Description: Returns a JSON Lockins object referring to bans

const fs = require('fs');
const colors = require('colors');

const rq_bans = {
  manifestdirs: ['./store'],
  manifest: ['./store/bans.json'],
  required: [],
  update(req, res) {
    console.log('[/bans]'.bold.brightBlue, 'Received new data. Updating...'.bold);
    if (req.body.top != undefined && req.body.jgl != undefined && req.body.mid != undefined && req.body.bot != undefined && req.body.sup != undefined) {
      fs.writeFileSync('./store/bans.json', JSON.stringify(req.body, null, 4));
      console.log('[/bans]'.bold.brightBlue, 'Done!'.bold);
		    return { code: 200, message: '{"response": 200, "message": "OK"}' };
    }
    console.log('[/bans]'.bold.brightBlue, 'Invalid data, did not update'.bold);
    return { code: 400, message: '{"response": 400, "err": "err_invalid_rq", "message": "Invalid request"}' };
  },
  serve(req, res) {
    data = String(fs.readFileSync('./store/bans.json'));
    return data;
  },
};

module.exports = rq_bans;
