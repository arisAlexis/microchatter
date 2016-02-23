'use strict';
const ChatService = require('../services/ChatService');
const express = require('express');
const lib = require('../mylib');
const auth = require('./auth');
const router = new express.Router();

router.post('/users/:username/messages', auth, (req, res) => {
  if (!req.body.body) return res.status(400).send({ error: 'no message field found' });

  ChatService.quickSend(req.auth.username, req.params.username, req.body.body)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

router.get('/', auth, (req, res, next) => {
  if (!req.query.offset || isNaN(req.query.offset)) req.query.offset = 0;
  if (!req.query.limit || isNaN(req.query.limit)) req.query.limit = 10;
  next();
});

router.get('/', (req, res) => {
  ChatService.getChats(req.auth.username, req.query.offset, req.query.limit)
  .then((chats) => res.json(chats))
  .catch((err) => lib.cerror(err, res));
});

router.use('/:chat_id', auth, (req, res, next) => {
  req.checkParams('chat_id').isInt();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
});

router.get('/:chat_id', auth, (req, res) => {
  ChatService.getChat(req.auth.username, req.params.chat_id)
  .then((chat) => res.json(chat))
  .catch((err) => lib.cerror(err, res));
});

router.get('/:chat_id/messages', auth, (req, res) => {
  ChatService.getMessages(req.auth.username, req.params.chat_id, req.query.offset, req.query.limit)
  .then((messages) => res.json(messages))
  .catch((err) => lib.cerror(err, res));
});

router.post('/:chat_id/messages', (req, res) => {
  ChatService.sendToChat(req.auth.username, req.params.chat_id, req.body.message)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

router.put('/:chat_id', (req, res) => {
  req.checkBody('status').optional().isAlpha();
  req.sanitizeBody('read').toBoolean();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

  if (req.body.status) {
    ChatService.updateStatus(req.auth.username, req.params.chat_id, req.body.status)
    .then(() => res.sendStatus(204))
    .catch((err) => lib.cerror(err, res));
  } else if (req.body.read) {
    ChatService.updateUnread(req.auth.username, req.params.chat_id, 0)
    .then(() => res.sendStatus(204))
    .catch((err) => lib.cerror(err, res));
  } else {
    return res.status(400).send({ error: 'status or unread field must be present' });
  }
});

router.delete('/:chat_id', (req, res) => {
  ChatService.del(req.auth.username, req.params.chat_id)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

module.exports = router;
