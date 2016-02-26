# Microchatter

is a backend server (subsystem) that you can easily integrate with your existing website so that users can have a mailbox and real-time chat.  

## Installation
1. Make sure you have the latest Node.js > 5.0 installed
2. [download](http://www.postgresql.org/download/) and install postgresql
3. `sudo service postgresql start`
4. `git clone https://github.com/arisalexis/microchatter.git`
5. `cd microchatter; npm install`
6. `su - postgres`
7. `createdb microchatter`
8. `psql -d microchatter -f path_to_project/db/createTablesAndRoles.sql`
9.  edit the config file sample.json to default.json (and override it according to your environment)
10. `npm test test/integration/**/*.js`
11. `export NODE_ENV=production`
12. `npm start` or you can use PM2 with `--node-args="-es_staging`

If everything is OK proceed to the next section.
*planning to build a read Docker image to facilitate installation*  

## Stack used

Node.js with the `-es_staging` flag  
Express 4  
[Socket.io](http://socket.io)  
Postgresql at least > **9.3x**

## Usage

Making a scalable chat is quite difficult. If you are planning to have millions of users probably this chat is not for you. Otherwise for medium sites and with
a proper postgresql installation it will be fine. The system uses the powerfull postgresql Arrays to store messages so not many indices and joins are used.

The idea is to have a one to one relationship with all the users of your existing database to this database so integration takes minimal effort.
Then you can use the system either by logging your client with **basic auth** or by using [JWT](http://www.postgresql.org/download/) (recommended)
If you chose the basic auth method you can execute all requests with these credentials (only on *HTTPS*) or use the returned jwt token.

There are multiple ways to populate the database:  

1. Use the rest admin interface and execute requests for every user on your system (slow)
2. The first time each user logins into the system with a valid [JWT](https://jwt.io) token (edit config file) the user will be created
3. Manually import into postgresql (table production.users) all usernames and passwords (using [MD5](http://www.postgresql.org/docs/9.0/static/functions-string.html))

*bear in mind that all users must be in the database, you cannot have some users sending messages to others that don't exist*

## What can you do with it

This backend  is totally front-end framework agnostic, you can use the [REST](#rest) server as you wish.

1. Send a message to another user (no brainer right?)
2. Display all conversations with other users in a chronological order and displaying how many unread messages you have
3. Block user & delete chat
4. Paginate messages for each chat
5. Get real-time messages and mark them as read
6. Add/Delete/Update users

## Configuration

```
{
  "secure":true,
  "SSL":{
      "key":"keys/privkey.pem",
      "cert":"keys/cert.pem",
      "ca":"keys/chain.pem"
  },
  "port":8080,
  "emit":true,
  "redis":{
       "host":"172.17.0.1",
       "port":"6379",
       "password":null
  },
  "jwtSecret":"a secret",
  "postgresql":{
    "host":"localhost",
    "port":"5432",
    "user":"microchatter",
    "password":"micro123",
    "database":"microchatter",
    "schema":"production"
  }
}
```

secure: true/false for using SSL, you can easily obtain keys for free from [letsencrypt](https://letsencrypt.org)  
emit: true/false means that you will be using a redis database to emit events to the socket.io server vs running it embedded

**important** changing the password in the config file is not enough you need to run `ALTER USER microchatter PASSWORD 'newpass';` from the command line  

## REST API

Please take a look at the [WIKI](https://github.com/arisalexis/microchatter/wiki)

## Socket IO

Optional to the system, you can use the real-time feature.  
You can use the socket.io client to connect to the server+port if you have emit:false or to your other socket.io server.

Each user has his own room listening and subscribed upon login.

New messages will be received with the event `newMessage` and an object of:  
```
{ chat_id,
  message: {
    sender,
    tstamp,
    body
  }
}
```
Depending on where your user is, you may just want to display an alert for new received message.  
If you are on the chats section and you don't have the chat_id loaded (it may be a new chat) then you need to get the chat details from the REST API.  
If it is the current chat you can just add the new message to the list. *It is good practice to then issue a call to the server that this chat is 'read'.*

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Please *respect the .eslintrc file* from [ESLint](http://eslint.org/) project and use a compatible browser (eg. [Atom](https://atom.io/))
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D

## TODO

Group chats (can I have a pull request for this? :) code has been written with this in mind  
Use session tokens from distributed cluster so user's don't have to login if you don't like jwt  
More thorough testing (right now most test are integration style)  
Stress test  
Docker ready installation  
Add Basic Auth to socket.io connection

## History

Version 0.5 first public commit on github.

## Credits

Aris Alexis Giachnis 2016

## License

[MIT License](https://opensource.org/licenses/MIT)
