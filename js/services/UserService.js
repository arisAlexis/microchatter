'use strict';
const db = require('./database');
const config = require('config');
const Errors = require('../Errors');
const schema = config.get('postgresql.schema');

exports.register = function register(username, password) {
  // note that since only qualified users are allowed to add new users we do not need to stress about sql injections
  return db.one('insert into ${schema~}.users(username,password) values(${username}, md5(${password})) returning username'
  , { schema, username, password });
};

exports.basicAuth = function basicAuth(username, password) {
  // todo sql injection with parameters
  return db.query('select username from ${schema~}.users where username=${username} and password=md5(${password})'
  , { schema, username, password })
  .then((data) => {
    if (!data.length) throw new Errors.UnauthorizedError();
    return { username: data[0].username };
  });
};

function _changePassword(username, password) {
  return db.query('update ${schema~}.users set password = md5(${password}) where username = ${username}'
  , { schema, username, password });
}

exports.update = function update(username, options) {
  const promisesArray = [];
  if (options.newPassword) {
    promisesArray.push(_changePassword(username, options.newPassword));
  }
  return Promise.all(promisesArray);
};

exports.del = function del(username) {
  return db.query('delete from ${schema~}.users where username = ${username}', { schema, username });
};
