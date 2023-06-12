const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');
const knex = require('knex');
const { handleRegister } = require('./controllers/register');
const { handleSignin } = require('./controllers/signin');
const { handleDetected } = require('./controllers/detected');
const { handleProfileRequest } = require('./controllers/profile');
const { handleDetect } = require('./controllers/detection-api');

const PORT = process.env.PORT || 3000;

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: 'postgres',
    password: process.env.PGPASS,
    database: process.env.PGDB,
  },
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/profile/:user', handleProfileRequest(db));

app.get('/detect', handleDetect);

app.post('/signin', handleSignin(db, argon2));

app.post('/register', handleRegister(db, argon2));

app.put('/detected', handleDetected(db));

app.listen(PORT);
