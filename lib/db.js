const fs = require('fs');
const { scheduleBatchEmail } = require('./controller.js');

const data = {
  results: [],
  pending: []
}

const store = (str, obj) => {
  try {
    data[str].push(obj);
    fs.writeFileSync(`${process.env.PWD}/lib/db/${str}.json`, JSON.stringify(data[str].map(obj => { if (obj.timeout) delete obj.timeout;return obj })))
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

const load = (str) => {
  try {
    console.log('trying to load '+str)
    const stored = JSON.parse(fs.readFileSync(`${process.env.PWD}/lib/db/${str}.json`));
    if (Array.isArray(stored) && stored.length > 0) {
      if (str === 'results') {
        data[str].push(...stored);
      } else {
        // stored pending items found
        stored.forEach(pend => {
          if (pend.id > Date.now() + 1500) {
            // we have time to reschedule the campaign
            const req = { body: pend.email };
            req.body.unixTime = pend.id;
            scheduleBatchEmail(req);
          } else {
            // desired send time has passed, store the failure in results
            store('results', {
              campaignId: pend.id,
              success: false,
              response: 'Scheduled time passed while server was restarting'
            })
          }
        })
      }
    }
    console.log('loaded '+str)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

const overwrite = (str, arr) => {
  data[str] = arr;
  try {
    fs.writeFileSync(`${process.env.PWD}/lib/db/${str}.json`, JSON.stringify(data[str].map(obj => { if (obj.timeout) delete obj.timeout;return obj })))
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

const filterPending = (id) => {
  const newPending = data['pending'].filter(msg => msg.id !== id);
  if (newPending.length !== data['pending'].length) {
    overwrite('pending', newPending)
  }
}

module.exports = {
  init: function() {
    load('results');
    load('pending');
  },
  get: function(str) {
    return data[str];
  },
  store,
  filterPending
}
