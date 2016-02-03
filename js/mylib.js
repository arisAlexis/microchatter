'use strict';
const jwt = require('jsonwebtoken');
const config = require('config');

const secret = config.get('jwtSecret');
const expiresIn = 86400;

exports.buildToken = function buildToken(tokenData) {
  const token = jwt.sign(tokenData, secret, { expiresIn });
  return token;
};

exports.cerror = function cerror(err, res) {
  const errorCode = err.code || err.statusCode || 500;

  if (errorCode === 500 || err.stack) {
    console.log(err);
  }

  res.status(errorCode).send({ error: err.message });
};

exports.tstamp = function tstamp() {
  return Math.round(new Date().getTime() / 1000);
};
