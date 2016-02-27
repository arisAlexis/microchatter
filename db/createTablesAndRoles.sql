CREATE DATABASE microchatter;
DROP SCHEMA if exists production CASCADE;
DROP SCHEMA if exists test CASCADE;
DROP SCHEMA if exists public CASCADE;
DROP ROLE if exists tester;
DROP ROLE if exists microchatter;

CREATE SCHEMA production;
CREATE SCHEMA test;

create table production.users(username text primary key, password text);
create table production.chats (chat_id serial primary key, title text, last_update timestamp, participants text[], messages JSON[]);
create table production.users_chats (chat_id integer references production.chats(chat_id) on delete cascade, username text references production.users(username) on delete cascade, status text, unread smallint default 0, primary key (chat_id,username));

create unique index on production.users (username);
INSERT INTO production.users (username,password) values ('admin',md5('admin123'));

CREATE USER tester;
CREATE USER microchatter;
ALTER USER tester PASSWORD 'test123';
ALTER USER microchatter PASSWORD 'micro123';
ALTER ROLE tester with login;
ALTER ROLE microchatter with login;
GRANT ALL ON DATABASE microchatter TO microchatter;
GRANT ALL ON DATABASE microchatter TO tester;
GRANT ALL PRIVILEGES ON SCHEMA production TO microchatter;
GRANT ALL PRIVILEGES ON SCHEMA test TO tester;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA production TO microchatter;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA test TO tester;
GRANT ALL ON ALL TABLES IN SCHEMA production TO microchatter;
GRANT ALL ON ALL TABLES IN SCHEMA test TO tester;
