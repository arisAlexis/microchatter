'use strict';
const db = require('./database');
const config = require('config');
const Errors = require('../Errors');
const schema = config.get('postgresql.schema');
const lib = require('../mylib');

function _createChat(userA, userB) {
  let chat_id;
  return db.query('insert into ${schema~}.chats (last_update) values(to_timestamp(${tstamp})) returning chat_id'
  , { schema, tstamp: lib.tstamp() })
    .then((res) => {
      chat_id = res[0].chat_id;
      return db.query('insert into ${schema~}.users_chats (chat_id,username) values(${chat_id},${userA})'
      , { schema, chat_id, userA })
        .then(() => db.query('insert into ${schema~}.users_chats (chat_id,username) values(${chat_id},${userB})'
        , { schema, chat_id, userB }));
    })
    .then(() => chat_id);
}

function _findChatBetween(userA, userB) {
  return db.query('select chat_id from ${schema~}.users_chats uc where username = ${userA} and chat_id in (select chat_id from ${schema~}.users_chats where username = ${userB})'
  , { schema, userA, userB })
    .then((res) => {
      if (!res.length) throw new Errors.NotFoundError();
      return res[0].chat_id;
    });
}

function _wasUpdated(res) {
  if (!res.length) throw new Errors.NotFoundError();
}

function _sendMessage(sender, chat_id, message) {
  return db.query('update ${schema~}.chats set messages = array_prepend(${message},messages) where chat_id = ${chat_id} returning chat_id'
  , {
    schema,
    chat_id,
    message: {
      sender,
      tstamp: lib.tstamp(),
      body: message,
    },
  })
  .then(_wasUpdated);
}

function _isMember(username, chat_id) {
  return db.query('select chat_id from ${schema~}.users_chats where chat_id=${chat_id} and username=${username}'
  , { schema, chat_id, username })
  .then((res) => (res.length) ? true : false);
}

exports.quickSend = function quickSend(sender, receiver, message) {
  // first check if there is a chat between these two
  return _findChatBetween(sender, receiver)
    .catch((e) => {
      if (e instanceof Errors.NotFoundError) {
        return _createChat(sender, receiver);
      }
      throw e;
    })
    .then((chat_id) => _sendMessage(sender, chat_id, message));
};

exports.updateStatus = function updateStatus(username, chat_id, status) {
  return db.query('update ${schema~}.users_chats set status = ${status} where chat_id = ${chat_id} and username = ${username} returning chat_id'
  , { schema, username, chat_id, status })
  .then(_wasUpdated);
};

exports.updateUnread = function updateUnread(username, chat_id, unread) {
  return db.query('update ${schema~}.users_chats set unread = ${unread} where chat_id = ${chat_id} and username = ${username} returning chat_id'
, { schema, username, chat_id, unread })
  .then(_wasUpdated);
};

exports.sendToChat = function sendToChat(sender, chat_id, message) {
  return _isMember(sender, chat_id)
  .then((isMember) => {
    if (!isMember) {
      throw new Errors.ForbiddenError();
    }
    return _sendMessage(sender, chat_id, message);
  });
};

exports.del = function del(username, chat_id) {
  return db.query('delete from ${schema~}.users_chats where chat_id = ${chat_id} and username = ${username} returning chat_id'
  , { schema, username, chat_id })
  .then(_wasUpdated);
};

exports.getMessages = function getMessages(username, chat_id, offset, limit) {
  return _isMember(username, chat_id)
  .then((isMember) => {
    if (!isMember) {
      throw new Errors.ForbiddenError();
    }
    return db.query('select messages[${offset}:${limit}] from ${schema~}.chats where chat_id = ${chat_id}'
    , { schema, username, offset, limit, chat_id })
    .then((res) => res[0]);
  });
};

exports.getUserChats = function getUserChats(username, query) {
  db.query('select ');
}
