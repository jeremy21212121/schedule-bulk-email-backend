const utils = require('../lib/utils.js');

module.exports = {
  rateLimited: (req,res, next) => {
    next( utils.buildError('ratelimit') )
  },
  main: (err, req, res, next) => {
    switch (err.name) {
      case 'SyntaxError':
        console.error(`Invalid JSON: ${err.message}`);
        res.status(400).json({ error: 'invalid JSON' });
        break;
      case 'spam':
        console.error(`Rejected suspected spam from ${req.ip}`);
        res.status(403).json({error: true});
        break;
      case 'sendmail':
        console.error(`Error sending mail: ${err}`);
        res.status(500).json({ error: 'Error sending mail' });
        break;
      case 'ratelimit':
        console.log(`Rate limited IP ${req.ip}`);
        res.status(429).json({ error: 'ratelimit' });
        break;
      case 'content-type':
        console.error(`Invalid request content-type header: ${req.headers['content-type']} (from IP: ${req.ip})`);
        res.status(415).json({ error: 'invalid content-type' });
        break;
      case 'contact-msg-obj':
        console.error(`Invalid data POSTed to /send.`);
        res.status(400).json({ error: 'invalid object' });
        break;
      case 'not-found':
        console.error(`404: ${req.path}`);
        res.status(404).json({ error: 'Not Found' });
        break;
        case 'invalid-pending-id':
        console.error(`Invalid pending ID submitted`);
        res.status(400).json({ error: 'Invalid pending ID' });
        break;
        case 'id-in-use':
        console.error(`Duplicate campaign time denied for ${req.body.unixTime}`);
        res.status(400).json({ error: 'A campaign is already scheduled for that time.' });
        break;
      default:
        console.error(`unknown error: ${err.name} ${err.message}`);
        res.status(500).json({error: true});
        break;
    }
  },
  fatal: (err, server) => {
    let errmsg = '';
    switch (err.code) {
      case 'EADDRINUSE':
        errmsg = 'Port is busy. Is the server already running?';
        break;
      case 'EACCES':
        errmsg = 'Permission denied. Ports < 1024 require root.';
        break;
      case 'ENETUNREACH':
        errmsg = 'Network Unreachable. Is fastmail down again? fastmailstatus.com'
      default:
        errmsg = 'Fatal error:';
        break;
    }
    console.error(`${errmsg} ${err}`)
    // process.exit(1);
    server.close();
  }
};
