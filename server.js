'use strict';

var app=require('./app');
var config=require('config');
var https=require('https');
var http=require('http');
var redis = require('socket.io-redis');
var fs = require('fs');
var socketioJwt = require('socketio-jwt');

if (process.env.NODE_ENV !== 'test') {

  const ssl_options = {
    key: fs.readFileSync(config.get('SSL.key')),
    cert: fs.readFileSync(config.get('SSL.cert')),
    ca: fs.readFileSync(config.get('SSL.ca'))
  };

  let server;

  if (config.get('secure')) {
    server = https.createServer(ssl_options, app).listen(config.get('port'));
  } else {
    server = http.createServer(app).listen(config.get('port'));
  }

  var io;
  if (config.get('emit')) {
    io = require('socket.io-emitter')({ host: config.get('redis.host'), port: config.get('redis.port') });
  }
  else {
     io = require("socket.io")(server);
     io.use(socketioJwt.authorize({
       secret: config.get('jwtSecret'),
       handshake: true
     }));

     io.on('connection', function (socket) {
       socket.join(socket.decoded_token.username);
     });
  }

  server.on('error', onError);
  server.on('listening', onListening);

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    console.log('listening on ' + bind);
  }
  exports.io = io;
}
