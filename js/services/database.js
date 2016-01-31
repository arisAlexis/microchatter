const config = require('config');
const pgpromise = require('pg-promise')();

const options = {
  host: config.get('postgresql.host'),
  port: config.get('postgresql.port'),
  database: config.get('postgresql.database'),
  user: config.get('postgresql.user'),
  password: config.get('postgresql.password'),
};

const db = pgpromise(options);
module.exports = db;
