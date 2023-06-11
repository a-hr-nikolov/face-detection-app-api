const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');
const knex = require('knex');

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

app.get('/profile/:user', async (req, res) => {
  const username = req.params.user;

  try {
    let [user] = await db.select('*').from('users').where('username', username);
    res.json(user);
  } catch {
    res.status(404).json("Couldn't get the requested user");
  }
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    let [user] = await db.select('*').from('login').where('username', username);

    const hashVerified = await argon2.verify(user.hash, password);
    if (!hashVerified) throw 'Wrong credentials';

    [user] = await db.select('*').from('users').where('username', username);

    res.json({ status: 'Success', object: user });
  } catch (err) {
    return res.status(400).json('Wrong credentials, try again.');
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (username === '')
    return res.status(409).json('Empty username/password not allowed');

  try {
    await db.transaction(async trx => {
      const [entry] = await trx('users').insert(
        {
          username: username,
          joined: new Date(),
        },
        '*'
      );
      try {
        const passHash = await argon2.hash(password);
        await trx('login').insert({
          username: username,
          hash: passHash,
        });
      } catch (err) {
        throw { code: 500, message: 'Hash fail' };
      }

      res.json(entry);
    });
  } catch (err) {
    if (err.code === 500)
      return res.status(500).json({ error: 'Internal Server Error' });
    return res.status(409).json({ error: 'Username is already taken' });
  }
});

app.put('/detected', async (req, res) => {
  const { username, detected } = req.body;

  try {
    let [user] = await db('users')
      .where('username', username)
      .update('detected', detected)
      .returning('*');
    res.json(user);
  } catch {
    res.status(400).send('No such user');
  }
});

app.listen(3000);
