const userService = require('../services/userService');
const jwt = require('express-jwt');
const express = require('express');
const config = require('config');
const lib = require('./mylib');
const auth = require('./auth');

const router = new express.Router();
const jwtSecret = config.get('jwtSecret');

router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  userService.basicAuth(req.body.username, req.body.password)
  .then((user) => {
    const token = lib.buildToken({ userId: user.user_id, username: user.username });
    res.json({ token });
  })
  .catch((err) => lib.cerror(err, res));
});

/**
 * registration with either a username and pass or a valid jwt token containing a username
 */
router.post('/',
jwt({ secret: jwtSecret, requestProperty: 'auth', credentialsRequired: false }), (req, res) => {
  if (!req.auth && (!req.body.username || !req.body.password)) return res.sendStatus(400);

  const username = (req.auth) ? req.auth.username : req.body.username;
  const password = (req.body.password) ? req.body.password : null;

  userService.register(username, password)
  .then((data) => {
    const token = lib.buildToken({ userId: data.user_id, username });
    res.json({ token });
  })
  .catch((err) => lib.cerror(err, res));
});

router.put('/:userId', auth, (req, res) => {
  userService.changePassword(req.auth.username, req.body.newPassword)
  .then(() => res.sendStatus(200))
  .catch((err) => lib.cerror(err, res));
});

exports = router;
