'use strict';
const db = require('./database');
const config = require('config');
const Errors = require('../Errors');
const schema = config.get('postgresql.schema');

exports.register = function register(username, password) {
  // note that since only qualified users are allowed to add new users we do not need to stress about sql injections
  return db.one(`insert into ${schema}.users(username,password) values($1, md5($2)) returning user_id`,
  [username, password]);
};

exports.basicAuth = function basicAuth(username, password) {
  // todo sql injection with parameters
  return db.query(`select user_id, username from ${schema}.users where username=$1 and password=md5($2)`,
  [username, password])
  .then((data) => {
    if (!data.length) throw new Errors.UnauthorizedError();
    return { user_id: data[0].user_id, username: data[0].username };
  });
};

function _changePassword(username, password) {
  return db.query(`update ${schema}.users set password = md5($2) where username = $1`,
  [username, password]);
}

exports.update = function update(username, options) {
  const promisesArray = [];
  if (options.newPassword) {
    promisesArray.push(_changePassword(username, options.newPassword));
  }
  return Promise.all(promisesArray);
};

exports.del = function del(username) {
  return db.query(`delete from ${schema}.users where username = '${username}'`);
};
