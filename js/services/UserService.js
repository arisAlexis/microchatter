'use strict';
const db = require('./database');
const config = require('config');
const Errors = require('../Errors');
const schema = config.get('postgresql.schema');

exports.register = function register(username, password) {
  if (password) {
    return db.one('insert into ${schema~}.users(username,password) values(${username}, md5(${password})) returning username'
    , { schema, username, password });
  } else {console.log('registering without')
    return db.one('insert into ${schema~}.users(username) values(${username}) returning username'
    , { schema, username });
  }
};

exports.basicAuth = function basicAuth(username, password) {
  // todo sql injection with parameters
  return db.query('select username from ${schema~}.users where username=${username} and password=md5(${password})'
  , { schema, username, password })
  .then((records) => {
    if (!records.length) throw new Errors.UnauthorizedError();
    return { username: records[0].username };
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

exports.find = function find(username) {
  return db.query('select * from ${schema~}.users where username=${username}'
  , { schema, username })
  .then((records) => {
    if (!records.length) throw new Errors.NotFoundError();
    return { username: records[0].username };
  });
};
