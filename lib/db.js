const fs = require('fs');

const data = {
  results: [],
  pending: []
}

const load = (str) => {
  try {
    console.log('trying to load '+str)
    const stored = JSON.parse(fs.readFileSync(`${process.env.PWD}/lib/db/${str}.json`));
    if (Array.isArray(stored) && stored.length > 0) {
      data[str].push(...stored);
    }
    console.log('loaded '+str)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
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
