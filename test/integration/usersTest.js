const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const supertest = require('supertest-as-promised');
const testUtil = require('./testUtil');
const app = require('../../app');
const config = require('config');
const jwt = require('jsonwebtoken');

const secret=config.get('jwtSecret');

describe('user CRUD', () => {
  beforeEach(testUtil.setupDb);

  it.only('register with admin', () => {
    return supertest(app)
    .post('/users/')
    .auth('admin', 'admin123')
    .send({ username: 'testUser3', password: 'lalala' })
    .set('Accept', 'application/json')
    .expect(200);
  });
  it('register without admin', () => {
    return supertest(app)
    .post('/users/')
    .auth('testUser1', 'test123')
    .send({ username: 'testUser3', password: 'lalala' })
    .set('Accept', 'application/json')
    .expect(400);
  });

});
