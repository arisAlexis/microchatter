'use strict';
const db = require('./database');
const config = require('config');
const schema = config.get('postgresql.schema');

exports.register = function register(username, password) {
  // note that since only qualified users are allowed to add new users we do not need to stress about sql injections
  return db.one(`insert into ${schema}.users(username,password) values($1, $2) returning user_id`,
  [username, password]);
};

exports.basicAuth = function basicAuth(username, password) {
  return db.query(`select username from ${schema}.users where username='${username}' and password='${password}'`)
  .then((data) => {
    if (data.length === 1) return true;
    else throw new Erro
  });
};
