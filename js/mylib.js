'use strict';
const jwt = require('jsonwebtoken');
const config = require('config');

const secret = config.get('jwtSecret');
const expiresInMinutes = 4320;

module.exports = function buildToken(tokenData) {
  return jwt.sign(tokenData, secret, { expiresInMinutes });
};

module.exports = function cerror(err, res) {
  const errorCode = err.code || err.statusCode || 500;

  if (errorCode === 500 || err.stack) {
    console.err(err);
  }

  res.status(errorCode).send({ error: err.message });
};

module.exports = function ustamp() {
  return Math.round(new Date().getTime() / 1000);
};
