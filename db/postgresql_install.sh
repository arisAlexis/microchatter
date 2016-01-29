service postgresql start
sudo -i -u postgres
createuser microchatter-test
createdb microchatter-test
createuser microchatter
createdb microchatter

psql -c "ALTER USER \"microchatter-test\" PASSWORD 'micro123';"
psql -c "ALTER USER \"microchatter\" PASSWORD 'micro123';"

psql microchatter < /usr/src/app/db/sql/cleandb.sql
