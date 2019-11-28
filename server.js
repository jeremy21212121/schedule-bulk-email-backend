'use strict';

const express = require('express');

const config = require('./config.js');
const router = require('./lib/router.js');

const errorHandler = require('./lib/errorHandler.js');
const db = require('./lib/db.js'); // improvised persistance mechanism
db.init();

const app = express();
app.enable('trust proxy'); //for proxying by eg. nginx in prod
app.set('x-powered-by', false);// this header is not needed

if (process.env.NODE_ENV !== 'production') {
  // enable cors on dev
  const cors = require('cors');
  app.use(cors());
};

app.use(express.json());

app.use('/v1', router);

app.use( errorHandler.main );

const server = app.listen(config.port, config.host, () => {
  console.log(`Listening on ${config.host}:${config.port}`)
});
server.on('error', errorHandler.fatal);
