drop table if exists test.users_chats;
drop table if exists test.users;
drop table if exists test.chats;
create table test.users(user_id serial primary key, username text not null, password text);
create table test.chats (chat_id serial primary key, last_update timestamp, messages JSON[]);
create table test.users_chats (chat_id integer references test.chats(chat_id), user_id integer references test.users(user_id));
INSERT INTO test.users (username,password) values ('admin',md5('admin123'));
INSERT INTO test.users (username,password) values ('testUser1',md5('test123'));
INSERT INTO test.users (username,password) values ('testUser2',md5('test123'));
