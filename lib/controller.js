const config = require('../config.js');
const nodemailer = require('nodemailer');
const utils = require('./utils.js');

const results = [];
let pending = [];

module.exports = {
  scheduleBatchEmail: (req, res, next) => {

    const diff = req.body.unixTime - Date.now();
    const unixTime = req.body.unixTime;

    // check to see if a campaign is already scheduled for that timestamp. we cant have duplicates because we use the timestamp as a unique ID
    const alreadyExists = pending.find(obj => obj.id === unixTime);
    if (alreadyExists) {
      return next(utils.buildError('id-in-use'))
    }

    // the following function is passed to setTimeout
    const fireMessages = () => {
      // create smtp transport pool
      const transporter = nodemailer.createTransport({
        service: config.service,
        pool: true,
        maxMessages: 200,
        auth: {
            user: config.auth.user,
            pass: config.auth.pass
        }
      });
      const messages = req.body.recipients.map(recipient => {
        return {
          to: recipient,
          subject: req.body.subject,
          from: config.mail.from,
          html: req.body.htmlEmail,
          text: req.body.txtEmail
        }
      })
      transporter.on('idle', () => {
        while (transporter.isIdle() && messages.length) {
          transporter.sendMail(messages.shift(), (err, info) => {
            results.push({
              campaignId: unixTime,
              address: info.envelope.to[0],
              success: info.rejected.length === 0,
              response: info.response,
              messageId: info.messageId
            })
          })
        }
        // remove item from pending array
        pending = pending.filter(msg => msg.id !== unixTime)
        // transporter will auto close after socketTimeout. Explicitly closing it is causing an error
      })
    }
    // add to pending array and start timeout
    pending.push({ id: unixTime, timeout: setTimeout(fireMessages, diff), recipients: req.body.recipients });
    res.json({ scheduled: true, id: unixTime });
  },
  getPending: (req, res) => {
    res.json({
      length: pending.length,
      pending: pending.map(item => {
        return {
          id: item.id,
          remaining: item.id - Date.now()
        }
      })
    })
  },
  cancelPending: (req, res) => {
    const pendingItem = pending.find(item => item.id === req.body.id);
    if (pendingItem.id) {
      clearTimeout(pendingItem.timeout);
      pending = pending.filter(item => item.id !== req.body.id)
      res.json({ success: true, cancelledId: req.body.id });
    } else {
      res.json({ error: true, message: `Couldn't find pending item: ${req.body.id}` })
    }
  },
  getResults: (req, res) => res.json({ length: results.length, results: results }),
  notFound: (req, res, next) => {
    // returns 404 when no routes match. enables sending a json 404 response
    next( utils.buildError('not-found') )
  }
}
