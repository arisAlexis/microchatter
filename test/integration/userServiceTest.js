const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const testUtil = require('../testUtil');
const UserService = require('../../js/services/UserService');

describe('chat service  test', () => {
  beforeEach(testUtil.setupDb);

  it('find user', () => UserService.find('testUser1').then((user) => expect(user.username).to.equal('testUser1')));
  it('find non-existent user', () => UserService.find('bogusUser1').should.be.rejected);
});
