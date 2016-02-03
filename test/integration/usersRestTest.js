const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const supertest = require('supertest-as-promised');
const testUtil = require('../testUtil');
const app = require('../../app');
const lib = require('../../js/mylib');

const jwtToken = lib.buildToken({ username: 'testUser4' });

function login(username, password) {
  return supertest(app)
  .post('/users/login')
  .auth(username, password)
  .set('Accept', 'application/json');
}

describe('user CRUD', () => {
  beforeEach(testUtil.setupDb);

  it('register with admin', () =>
    supertest(app)
    .post('/users/')
    .auth('admin', 'admin123')
    .send({ username: 'testUser4', password: 'lalala' })
    .set('Accept', 'application/json')
    .expect(200)
  );
  it('register without admin', () =>
    supertest(app)
    .post('/users/')
    .auth('testUser1', 'test123')
    .send({ username: 'testUser4', password: 'lalala' })
    .set('Accept', 'application/json')
    .expect(400)
  );
  it('register with jwt', () =>
    supertest(app)
    .post('/users/')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ username: 'testUser4', password: 'lalala' })
    .set('Accept', 'application/json')
    .expect(200)
  );
  it('update password as owner', () =>
    supertest(app)
    .put('/users/')
    .auth('testUser1', 'test123')
    .send({ newPassword: 'lalala' })
    .set('Accept', 'application/json')
    .expect(204)
    .then(() => login('testUser1', 'lalala').expect(200))
  );
  it('update password as admin', () =>
    supertest(app)
    .put('/users/testUser1')
    .auth('admin', 'admin123')
    .send({ newPassword: 'lalala' })
    .set('Accept', 'application/json')
    .expect(204)
    .then(() => login('testUser1', 'lalala').expect(200))
  );
  it('login with basic auth', () =>
    supertest(app)
    .post('/users/login')
    .auth('testUser1', 'test123')
    .set('Accept', 'application/json')
    .expect(200)
    .then(() =>
      supertest(app)
     .post('/users/login')
     .auth('testUser1', 'bogus')
     .set('Accept', 'application/json')
     .expect(401))
  );
  it('delete a user', () =>
    supertest(app)
    .delete('/users/testUser1')
    .auth('admin', 'admin123')
    .set('Accept', 'application/json')
    .expect(204)
  );
});
