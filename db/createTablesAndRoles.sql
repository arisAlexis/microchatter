DROP DATABASE microchatter;
CREATE DATABASE microchatter;
CREATE SCHEMA production;
CREATE SCHEMA test;
CREATE USER tester;
CREATE USER microchatter;
ALTER USER tester PASSWORD 'test123';
ALTER USER microchatter PASSWORD 'micro123';
GRANT ALL ON DATABASE microchatter TO microchatter;
GRANT ALL ON DATABASE microchatter TO tester;
CREATE SCHEMA production;
CREATE SCHEMA test;
GRANT ALL PRIVILEGES ON SCHEMA production TO microchatter;
GRANT ALL PRIVILEGES ON SCHEMA test TO tester;
GRANT ALL ON ALL TABLES IN SCHEMA production TO microchatter;
GRANT ALL ON ALL TABLES IN SCHEMA test TO tester;
ALTER ROLE tester with login;
ALTER ROLE microchatter with login;

drop table if exists production.users_chats;
drop table if exists production.users;
drop table if exists production.chats;
create table production.users(username text primary key, password text);
create table production.chats (chat_id serial primary key, title text, last_update timestamp, participants text[], messages JSON[]);
create table production.users_chats (chat_id integer references test.chats(chat_id) on delete cascade, username text references test.users(username) on delete cascade, status text, unread smallint default 0, primary key (chat_id,username));

create unique index on production.users (username);
