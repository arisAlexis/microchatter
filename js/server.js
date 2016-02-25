'use strict';

const app = require('./app');
const config = require('config');
const https = require('https');
const http = require('http');
const fs = require('fs');

const ssl_options = {
  key: fs.readFileSync(config.get('SSL.key')),
  cert: fs.readFileSync(config.get('SSL.cert')),
  ca: fs.readFileSync(config.get('SSL.ca')),
};

let server;

if (config.get('secure')) {
  server = https.createServer(ssl_options, app).listen(config.get('port'));
} else {
  server = http.createServer(app).listen(config.get('port'));
}

function onListening() {
  const addr = server.address();
  const bind = (typeof addr === 'string') ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('listening on ' + bind);
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  server.on('error', onError);
  server.on('listening', onListening);

  const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

module.exports = server;
