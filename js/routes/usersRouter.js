'use strict';
const UserService = require('../services/UserService');
const jwt = require('express-jwt');
const express = require('express');
const config = require('config');
const lib = require('../mylib');
const auth = require('./auth');

const router = new express.Router();
const jwtSecret = config.get('jwtSecret');

router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  UserService.basicAuth(req.body.username, req.body.password)
  .then((user) => {
    const token = lib.buildToken({ userId: user.user_id, username: user.username });
    res.json({ token });
  })
  .catch((err) => lib.cerror(err, res));
});

/**
 * registration with either a username and pass or a valid jwt token containing a username
 */
router.post('/', auth, (req, res) => {
  // only the admin account can perform registrations (that is called from the other backend)
  if (!req.auth.username === 'admin') return res.sendStatus(400);

  if (!req.body.username || ! req.body.password) return res.sendStatus(400);

  UserService.register(req.body.username, req.body.password)
  .then((data) => {
    const token = lib.buildToken({ userId: data.user_id, username: req.body.username });
    res.json({ token });
  })
  .catch((err) => lib.cerror(err, res));
});

router.put('/', auth, (req, res) => {
  if (!req.body.newPassword) return res.sendStatus(400);

  UserService.changePassword(req.auth.username, req.body.newPassword)
  .then(() => res.sendStatus(200))
  .catch((err) => lib.cerror(err, res));
});

module.exports = router;
