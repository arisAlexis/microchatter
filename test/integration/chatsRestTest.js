const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const supertest = require('supertest-as-promised');
const testUtil = require('../testUtil');
const app = require('../../app');
const lib = require('../../js/mylib');

const jwtToken = lib.buildToken({
  username: 'testUser1',
});

describe('user CRUD', () => {
  beforeEach(testUtil.setupDb);

  it('send quick message to user', () =>
    supertest(app)
    .post('/chats/users/testUser2/messages')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ message: 'hiya' })
    .expect(204)
  );
  it('update chat', () => {
    const status = supertest(app)
      .put('/chats/1/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'hidden' })
      .expect(204);

    const read = supertest(app)
      .put('/chats/1/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ read: true })
      .expect(204);

    const notNumber = supertest(app)
      .put('/chats/number/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'hidden' })
      .expect(400);

    return Promise.all([status, read, notNumber]);
  });
  it('delete chat', () =>
    supertest(app)
    .del('/chats/1/')
    .set('Authorization', `Bearer ${jwtToken}`)
    .expect(204)
  );
  it.only('get messages from chat', () => {
    const existing = supertest(app)
      .get('/chats/1/messages/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ offset: 1, limit: 2 })
      .expect(200)
      .then((res) => {
        expect(res.body.messages.length).to.equal(2);
      });

    const secondToken = lib.buildToken({ username: 'testUser3' });
    const notMember = supertest(app)
      .get('/chats/1/messages')
      .set('Authorization', `Bearer ${secondToken}`)
      .query({ offset: 1, limit: 2 })
      .expect(403);

    return Promise.all([existing, notMember]);
  });
});