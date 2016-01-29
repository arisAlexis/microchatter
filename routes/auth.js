/**
 * Provides a middleware function that handles basic auth, jwt and/or sessions
 * and writes the username in the req.auth object. It throws errors accordingly.
 */
const jwt = require('jsonwebtoken');

function _getToken (req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

module.exports = function auth(req, res, next) {
  const token = _getToken(req);

  if (verified) {
    req.auth = { }
  }

  next();
};
