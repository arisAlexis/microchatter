
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const testUtil = require('../testUtil');
const rewire = require('rewire');
const ChatService = rewire('../../js/services/ChatService');


describe('chat service  test', () => {
  beforeEach(testUtil.setupDb);

  it('find chat between users', () => {
    // this is a private function
    const findChatBetween = ChatService.__get__('_findChatBetween');
    return findChatBetween('testUser1', 'testUser2').should.eventually.equal(1);
  });
  it('create a new chat', () => {
    const createChat = ChatService.__get__('_createChat');
    return createChat().should.eventually.exist;
  });
  it('check participation', () => {
    const isMember = ChatService.__get__('_isMember');
    return isMember('testUser1', 1).should.eventually.be.true
    .then(() => isMember('testUser3', 1).should.eventually.be.false);
  });
  it('send message to non-existent', () => {
    const sendMessage = ChatService.__get__('_sendMessage');
    return sendMessage('testUser1', 100).should.eventually.be.rejected;
  });
  it('send new message to a chat', () =>
    ChatService.sendToChat('testUser1', 1, 'hey bro').should.eventually.be.fulfilled
    .then(() => ChatService.sendToChat('testUser3', 1, 'hey bro').should.eventually.be.rejected)
  );
  it('get user chats', () =>
    ChatService.getChats('testUser1', 0, 10)
      .then((chats) => {
        expect(chats.length).to.equal(2);
        expect(chats[0].title).to.equal('testUser2');
      })
  );
});
