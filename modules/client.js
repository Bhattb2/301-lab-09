const pg = require('pg');
require ('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL); //server becomes client, connects to database
client.on('error', err => console.error(err)); //confirms if you are up and running

module.exports = client;