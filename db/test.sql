drop table if exists test.users_chats;
drop table if exists test.users;
drop table if exists test.chats;
create table test.users(username text primary key, password text);
create table test.chats (chat_id serial primary key, title text, last_update timestamp, participants text[], messages JSON[]);
create table test.users_chats (chat_id integer references test.chats(chat_id) on delete cascade, username text references test.users(username) on delete cascade, status text, unread smallint default 0, primary key (chat_id,username));

INSERT INTO test.users (username,password) values ('admin',md5('admin123'));
INSERT INTO test.users (username,password) values ('testUser1',md5('test123'));
INSERT INTO test.users (username,password) values ('testUser2',md5('test123'));
INSERT INTO test.users (username,password) values ('testUser3',md5('test123'));
INSERT INTO test.chats (chat_id,participants,messages) values (1,array['testUser1','testUser2'],array['{"sender":"testUser1","body":"hey buddy!"}','{"sender":"testUser2","body":"yo"}','{"sender":"testUser1","body":"what gives?"}']::json[]);
INSERT INTO test.chats (chat_id,participants,messages) values (2,array['testUser1','testUser3'],array['{"sender":"testUser1","body":"nice writing!"}']::json[]);
INSERT INTO test.users_chats (chat_id,username) values(1,'testUser1');
INSERT INTO test.users_chats (chat_id,username,status,unread) values(1,'testUser2','visible',2);
INSERT INTO test.users_chats (chat_id,username) values(2,'testUser1');
INSERT INTO test.users_chats (chat_id,username) values(2,'testUser3');

SELECT setval('test.chats_chat_id_seq', (SELECT MAX(chat_id) from test.chats));
