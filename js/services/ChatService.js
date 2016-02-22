'use strict';
const db = require('./database');
const config = require('config');
const Errors = require('../Errors');
const schema = config.get('postgresql.schema');
const lib = require('../mylib');
let io = require('../../server').io;

function _createChat(title) {
  return db.query('insert into ${schema~}.chats (title) values(${title}) returning chat_id'
  , { schema, title })
  .then((res) => res[0].chat_id);
}

function _addParticipants(chat_id, ...participants) {
  const promiseArray = [];
  participants.forEach((participant) => {
    const ipromise = db.query('insert into ${schema~}.users_chats (chat_id,username) values(${chat_id},${username})'
    , { schema, chat_id, username: participant });
    promiseArray.push(ipromise);
    const upromise = db.query('update ${schema~}.chats set participants = array_append(participants,${username}) where chat_id = ${chat_id}'
    , { schema, chat_id, username: participant });
    promiseArray.push(upromise);
  });

  return Promise.all(promiseArray);
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
  return;
}

/**
 * Transforms a raw postgresql row to a chat object to our liking like a simplified ORM
 * @param  {string} username user to be excluded from the title,i.e the user who will receive the chat object
 * @param  {object} row      raw postgresql object
 * @return {object}          transformed object that includes fields for the view layer
 */
function _transformChat(username, row) {
  const chat = {
    chat_id: row.chat_id,
    last_message: row.messages[0],
    unread: row.unread,
    title: (row.title) ? row.title : row.participants.filter((p) => p !== username).join(','),
  };
  return chat;
}

function _chatDetails(chat_id) {
  return db.query('select chat_id,last_update,title,participants,messages[0-10] from ${schema~}.chats where chat_id = ${chat_id}'
  , { schema, chat_id })
  .then((res) => {
    if (!res.length) throw new Errors.NotFoundError();
    return res[0];
  });
}

/**
 * Real-time dispatch of a new message to all of the chat's participants using socketio
 * @param  {string} sender  sender of message
 * @param  {string} chat_id
 * @param  {object} message
 * @return {void}
 */
function _dispatch(sender, chat_id, message) {
  return _chatDetails(chat_id)
  .then((rawChat) => {
    rawChat.participants.forEach((participant) => {
      if (participant !== sender) {
        if (process.env.NODE_ENV !== 'test') {
          io.to(participant).emit('newMessage', { chat_id, message });
        }
      }
    });
  });
}

function _sendMessage(sender, chat_id, msg) {
  const tstamp = lib.tstamp();
  const message = {
    sender,
    tstamp,
    body: msg,
  };
  return db.query('update ${schema~}.chats set last_update = to_timestamp(${tstamp}) , messages = array_prepend(${message},messages) where chat_id = ${chat_id} returning chat_id'
  , {
    schema,
    chat_id,
    tstamp,
    message,
  })
  .then(_wasUpdated)
  .then(() => _dispatch(sender, chat_id, message));
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
        let chat_id;
        return _createChat()
                .then((cid) => {
                  chat_id = cid;
                  return _addParticipants(chat_id, sender, receiver);
                })
                // we just need to return this because _addParticipants doesn't return it
                .then(() => chat_id);
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

exports.getChats = function getUserChats(username, offset, limit) {
  return db.query('select c.chat_id, c.title, c.participants, c.messages[0:1], uc.unread from ${schema~}.chats c inner join ${schema~}.users_chats uc on c.chat_id = uc.chat_id where uc.username = ${username} and (uc.status = \'visible\' or uc.status is null) order by c.last_update desc limit ${limit} offset ${offset}'
  , { schema, username, offset, limit })
  .then((res) => {
    // transformation
    const chats = [];
    res.forEach((row) => chats.push(_transformChat(username, row)));
    return chats;
  });
};

exports.getChat = function getChat(username, chat_id) {
  return _chatDetails(chat_id).then((rawChat) => _transformChat(username, rawChat));
}
