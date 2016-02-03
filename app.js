const app = require('express')();
const bodyParser = require('body-parser');
const usersRouter = require('./js/routes/usersRouter');
const chatsRouter = require('./js/routes/chatsRouter');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const lib = require('./js/mylib');

app.use(morgan('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use('/users', usersRouter);
app.use('/chats', chatsRouter);

app.use((err, req, res) => {
  lib.cerror(err, res);
});

module.exports = app;
