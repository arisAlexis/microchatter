'use strict';
/**
 * Provides a middleware function that handles basic auth, jwt and/or sessions
 * and writes the username in the req.auth object. It throws errors accordingly.
 */
const jwt = require('jsonwebtoken');
const basicAuth = require('basic-auth');
const config = require('config');
const UserService = require('../services/UserService');
const lib = require('../mylib');

const jwtSecret = config.get('jwtSecret');

function _getToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

module.exports = function auth(req, res, next) {
  // try with jwt
  const token = _getToken(req);
  if (token) {
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      return res.sendStatus(401);
    }
    req.auth = { mode: 'jwt', username: decoded.username };
    next();
  }
  // try basic auth
  const basicUser = basicAuth(req);
  if (basicUser && (!basicUser.name || !basicUser.pass)) {
    return res.sendStatus(401);
  }
  if (basicUser) {
    UserService.basicAuth(basicUser.name, basicUser.pass)
    .then((dbuser) => {
      req.auth = { mode: 'basic', username: dbuser.username };
      next();
    })
    .catch((err) => lib.cerror(err, res));
  }
};
