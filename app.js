const app = require('express')();
const usersRouter = require('./js/routes/usersRouter');
const chatsRouter = require('./js/routes/chatsRouter');

app.use('/users', usersRouter);
//app.use('/chats', chatsRouter);

module.exports = app;
