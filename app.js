const app = require('express')();
const bodyParser = require('body-parser');
const usersRouter = require('./js/routes/usersRouter');
const chatsRouter = require('./js/routes/chatsRouter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/users', usersRouter);
//app.use('/chats', chatsRouter);

module.exports = app;
