# Microchatter

is a backend server (subsystem) that you can easily integrate with your existing website so that users can havea mailbox and real-time communication.  

## Installation

1. [download](http://www.postgresql.org/download/) and install postgresql
2. `git clone https://arisalexis.github.com/microchatter`
3. `cd microchatter; npm install`
4. `su - postgres`
5. `psql -d microchatter -f path_to_project/db/createTablesAndRoles.sql`
6. `psql -d microchatter -f test.sql` (optional only if you want to run the tests to verify it is working)
7. **edit** the config file default.json (and override it according to your environment)
8. `npm test test/integration/**/*.js`

If everything is OK proceed to the next section.

## Stack used

Node.js (express4 + many modules) with the latest `-es_staging` flag with support for arrow functions,block variables etc.
[Socket.io](http://socket.io)
Postgresql at least > **9.3x**

## Usage

Making a scalable chat is quite difficult. If you are planning to have millions of users probably this chat is not for you. Otherwise for medium sites and with   
a proper postgresql installation it will be fine. The system uses the powerfull postgresql Arrays to store messages so not many indices and relations are used.

The idea is to have a one to one relationship with all the users of your existing database to this database so integration takes minimal effort. 
Then you can use the system either by logging your client with **basic auth** or by using [JWT](http://www.postgresql.org/download/) (recommended)
If you chose the basic auth method you can execute all requests with these credentials (only on *HTTPS*) or use the returned jwt token.

There are multiple ways to do it:  

1. Use the rest admin interface and execute requests for every user on your system (slow)
2. The first time each user logins into the system with a valid [JWT](http://www.postgresql.org/download/) token (edit config file) the user will be created
3. Manually import into postgresql (table production.users) all usernames and passwords (using [MD5](http://www.postgresql.org/docs/9.0/static/functions-string.html))

## What can you do with it

This backend  is totally front-end framework agnostic, you can use the [REST](#rest) server as you wish.

1. Send a message to another user (no brainer right?)
2. Display all conversations with other users in a chronological order and displaying how many unread messages you have
3. Block user & delete chat
4. Paginate messages for each chat
5. Get real-time messages and mark them as read
6. Add/Delete/Update users

Have a look at the [snippets]() directory for examples and tips

## <a name="rest"></a>Rest Endpoints

# /users

`POST /login` Basic Auth or JWT `Bearer` returns JWT token (weather you want it or not :)
`POST /register` Basic Auth or JWT **as admin** payload `{ username: String, password: String (optional) }`

# /chats



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

## History

Version 0.5 first public commit on github.

## Credits

Aris Alexis Giachnis 2016

## License

[MIT License](https://opensource.org/licenses/MIT)