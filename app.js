const app = require('express')();
const usersRouter = require('routes/usersRouter');
const chatsRouter = require('routes/chatsRouter');

app.use('/users', usersRouter);
app.use('/chats', chatsRouter);
