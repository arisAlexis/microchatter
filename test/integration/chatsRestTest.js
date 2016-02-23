const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const supertest = require('supertest-as-promised');
const testUtil = require('../testUtil');
const mockery = require('mockery');
mockery.enable({
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false,
});
mockery.registerAllowable('../../js/app');
mockery.registerSubstitute('../io.js', '../../test/integration/ioMock.js');
const app = require('../../js/app');
const lib = require('../../js/mylib');

const jwtToken = lib.buildToken({ username: 'testUser1' });
const secondToken = lib.buildToken({ username: 'testUser2' });

describe('user CRUD', () => {
  beforeEach(testUtil.setupDb);

  it('send quick message to user', () =>
    supertest(app)
    .post('/chats/users/testUser2/messages')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ body: 'hiya' })
    .expect(204)
    .then(() =>
      // this should also create a new chat between them
      supertest(app)
      .post('/chats/users/testUser3/messages')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ body: 'hiya b' })
      .expect(204)
    )
    .then(() =>
      supertest(app)
      .post('/chats/users/bogusUser3/messages')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ body: 'hiya c' })
      .expect(404)
    )
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
  it('get messages from chat', () => {
    const existing = supertest(app)
      .get('/chats/1/messages/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ offset: 1, limit: 2 })
      .expect(200)
      .then((res) => {
        expect(res.body.messages.length).to.equal(2);
      });

    const thirdToken = lib.buildToken({ username: 'testUser3' });
    const notMember = supertest(app)
      .get('/chats/1/messages')
      .set('Authorization', `Bearer ${thirdToken}`)
      .query({ offset: 1, limit: 2 })
      .expect(403);

    return Promise.all([existing, notMember]);
  });
  it('get chat details', () => {
    supertest(app)
    .get('/chats/1')
    .set('Authorization', `Bearer ${jwtToken}`)
    .expect(200)
    .then((res) => {
      expect(res.body.title).to.equal('testUser1');
    });
  });
});
