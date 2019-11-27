const utils = require('../lib/utils.js');

// returns true if str is a string & is not 0-length or all whitespace
const notEmptyOrWhitespace = (str) => (typeof str === "string" && str.trim());

// required fields
const validFields = [
  {
    name: 'unixTime',
    type: 'number',
    // time is in future and isnt further in future than 24 days (max setTimeout delay)
    validate: (val) => val > Date.now() && ((val - Date.now()) < 2147483647)
  },
  {
    name: 'subject',
    type: 'string',
    validate: notEmptyOrWhitespace
  },
  {
    name: 'txtEmail',
    type: 'string',
    validate: notEmptyOrWhitespace
  },
  {
    name: 'htmlEmail',
    type: 'string',
    validate: notEmptyOrWhitespace
  },
  {
    name: 'recipients',
    type: 'object',
    // non-empty array and passes basic email regex
    validate: (val) => Array.isArray(val) && val.length > 0 && val.every(str => /^\S+@\S+\.\S+$/.test(str))
  }
]

module.exports = {

  verifyContentType: (req, res, next) => req.is('json') ? next() : next(utils.buildError('content-type')),

  verifyFields: (req, res, next) => {
    const valid = validFields.every( field =>
    // check that each property exists, is correct type and passes validate function
      req.body.hasOwnProperty(field.name)
      && typeof req.body[field.name] === field.type
      && field.validate(req.body[field.name])
    );
    if (valid) {
      next()
    } else {
      next( utils.buildError('contact-msg-obj') )
    }
  },

  verifyPendingId: (req, res, next) => {
    if (req.body.id && typeof req.body.id === 'number' && req.body.id > 0) {
      next()
    } else {
      next(utils.buildError('invalid-pending-id'))
    }
  }

};
