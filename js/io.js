'use strict';

const server = require('./server.js');
const socketioJwt = require('socketio-jwt');
const config = require('config');

let io;
if (config.get('emit')) {
  io = require('socket.io-emitter')({ host: config.get('redis.host'), port: config.get('redis.port') });
} else {
  io = require('socket.io')(server);
  io.use(socketioJwt.authorize({
    secret: config.get('jwtSecret'),
    handshake: true,
  }));
  io.on('connection', (socket) => {
    socket.join(socket.decoded_token.username);
  });
}

module.exports = io;
