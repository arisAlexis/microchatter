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

    const unread = supertest(app)
      .put('/chats/1/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ unread: 5 })
      .expect(204);

    const notNumber = supertest(app)
      .put('/chats/number/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'hidden' })
      .expect(400);

    return Promise.all([status, unread, notNumber]);
  });
  it.only('delete chat', () =>
    supertest(app)
    .del('/chats/1/')
    .set('Authorization', `Bearer ${jwtToken}`)
    .expect(204)
  );
});
