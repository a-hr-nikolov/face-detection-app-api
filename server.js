require('dotenv').config();
const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');
const { handleRegister } = require('./controllers/register');
const { handleSignin } = require('./controllers/signin');
const { handleDetected } = require('./controllers/detected');
const { handleProfileRequest } = require('./controllers/profile');
const { handleDetect } = require('./controllers/detection-api');
const { knexOptions } = require('./config/knexOptions');
const { corsOptions } = require('./config/corsOptions');

const db = require('knex')(knexOptions);

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({ corsOptions }));

app.use(express.json());

app.get('/profile/:user', handleProfileRequest(db));

app.get('/detect', handleDetect);

app.post('/signin', handleSignin(db, argon2));

app.post('/register', handleRegister(db, argon2));

app.put('/detected', handleDetected(db));

app.listen(PORT);
