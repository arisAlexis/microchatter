'use strict';
const ChatService = require('../services/ChatService');
const express = require('express');
const lib = require('../mylib');
const auth = require('./auth');
const router = new express.Router();

router.post('/users/:username/messages', auth, (req, res) => {
  if (!req.body.message) return res.status(400).send({ error: 'no message field found' });

  ChatService.quickSend(req.auth.username, req.params.username, req.body.message)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

router.use('/:chat_id', auth, (req, res, next) => {
  req.checkParams('chat_id').isInt();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
});

router.post('/:chat_id/messages', (req, res) => {
  ChatService.sendToChat(req.auth.username, req.params.chat_id, req.body.message)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

router.put('/:chat_id', (req, res) => {
  req.checkBody('status').optional().isAlpha();
  req.checkBody('unread').optional().isInt();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

    if (req.body.status) {
      ChatService.updateStatus(req.auth.username, req.params.chat_id, req.body.status)
      .then(() => res.sendStatus(204))
      .catch((err) => lib.cerror(err, res));
    }
    else if (req.body.unread) {
      ChatService.updateUnread(req.auth.username, req.params.chat_id, req.body.unread)
      .then(() => res.sendStatus(204))
      .catch((err) => lib.cerror(err, res));
    }
    else return res.status(400).send({ error: 'status or unread field must be present' })
});

router.delete('/:chat_id', (req, res) => {
  ChatService.del(req.auth.username, req.params.chat_id)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

module.exports = router;
