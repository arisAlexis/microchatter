var app=require('./app');
var config=require('config');
var https=require('https');
var http=require('http');

const ssl_options = {
  key: fs.readFileSync(config.get('sslKey')),
  cert: fs.readFileSync(config.get('sslCert')),
};

let server;

if (config.get('secure')) {
  server= https.createServer(ssl_options, app).listen(config.get('sslPort'));
}
else {
  server=http.createServer(app).listen(config.get('port'));
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
