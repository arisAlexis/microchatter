'use strict';
const UserService = require('../services/UserService');
const express = require('express');
const lib = require('../mylib');
const auth = require('./auth');
const router = new express.Router();

router.post('/login', auth, (req, res) => {
  // check if the user exists or not if we only have a jwt
  if (req.auth.mode === 'jwt') {
    UserService.find(req.auth.username)
    .then(()=> res.sendStatus(200))
    .catch((e) => {console.log('registering')
      // we need to register him
      UserService.register(req.auth.username)
      .then(()=> res.sendStatus(200))
      .catch((err) => lib.cerror(err, res));
    });
  } else if (req.auth.mode === 'basic') {
    const token = lib.buildToken({ username: req.auth.username });
    return res.json({ token });
  }
});

/**
 * registration with either a username and pass or a valid jwt token containing a username
 */
router.post('/', auth, (req, res) => {
  // only the admin account can perform registrations (that is called from the other backend)
  let username;
  if (req.auth.mode === 'basic') {
    if (req.auth.username !== 'admin') return res.status(400).send({ error: 'only admin can register users' });
    if (!req.body.username || ! req.body.password) return res.status(400).send({ error: 'no username or password on post body' });
    username = req.body.username;
  } else if (req.auth.mode === 'jwt') {
    // password is optional here
    if (req.auth.username === 'admin' && !req.body.username) return res.status(400).send({ error: 'no username found on post body' });
    username = (req.auth.username === 'admin') ? req.body.username : req.auth.username;
  } else return res.status(400).send({ error: 'unsupported authentication method (only jwt and basic auth)' });

  UserService.register(username, req.body.password)
  .then((data) => {
    const tokenData = { username: data.username };
    const token = lib.buildToken(tokenData);
    return res.json({ token });
  })
  .catch((err) => lib.cerror(err, res));
});

function _update(username, options) {
  const validOptions = {
    newPassword: options.newPassword,
  };
  return UserService.update(username, validOptions);
}

router.put('/:username', auth, (req, res) => {
  if (req.auth.username !== 'admin' && req.auth.username !== req.params.username) {
    return res.status(401);
  }
  _update(req.params.username, req.body)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

router.put('/', auth, (req, res) => {
  _update(req.auth.username, req.body)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});


// only the admin can delete users
router.delete('/:username', auth, (req, res) => {
  if (req.auth.username !== 'admin') return res.send(401);
  UserService.del(req.params.username)
  .then(() => res.sendStatus(204))
  .catch((err) => lib.cerror(err, res));
});

module.exports = router;
