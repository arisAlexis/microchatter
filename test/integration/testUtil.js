'use strict';
const fs = require('fs');
const config = require('config');
const pgpromise = require('pg-promise')();

const options = {
  host: config.get('postgresql.host'),
  port: config.get('postgresql.port'),
  database: 'microchatter',
  user: 'tester',
  password: 'test123',
};

const db = pgpromise(options);
const sql = fs.readFileSync('./db/test.sql').toString();

exports.setupDb = function setupDb() {
  return db.query(sql);
};
