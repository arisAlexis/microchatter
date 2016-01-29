const db = require('./databaseService');

module.exports = function register(username, password) {
  return db.one('INSERT INTO USERS(username,password) values($1, $2) returning user_id',
  [username, password]);
};
