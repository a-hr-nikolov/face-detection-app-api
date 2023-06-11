const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');
const knex = require('knex');
const { handleRegister } = require('./controllers/register');
const { handleSignin } = require('./controllers/signin');
const { handleDetected } = require('./controllers/detected');
const { handleProfileRequest } = require('./controllers/profile');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'face-detect-app',
  },
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/profile/:user', handleProfileRequest(db));

app.post('/signin', handleSignin(db, argon2));

app.post('/register', handleRegister(db, argon2));

app.put('/detected', handleDetected(db));

app.listen(3000);
