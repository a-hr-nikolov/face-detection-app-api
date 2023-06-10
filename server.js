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

db.select('*')
  .from('login')
  .where('username', 'jonkata')
  .then(([data]) => console.log(data));

class User {
  static createdCount = 0;
  constructor(username, passHash) {
    this.id = (++User.createdCount).toString().padStart(8, '0');
    this.username = username;
    this.passHash = passHash;
    this.facesDetected = 0;
    this.registrationDate = new Date();
  }
}

const database = {
  users: [],
};

argon2.hash('strongestpass').then(hash => {
  database.users.push(new User('Jonkata', hash));
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json(database.users);
});

app.get('/profile/:user', (req, res) => {
  const username = req.params.user;
  const reqUser = database.users.find(user => user.username === username);

  if (reqUser) res.json(reqUser);
  else res.status(404).json("The requested user doesn't exist.");
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
    const entry = await db('users').returning('*').insert({
      username: username,
      joined: new Date(),
    });
    try {
      const passHash = await argon2.hash(password);
      await db('login').insert({
        username: username,
        hash: passHash,
      });
      res.json(entry);
    } catch (error) {
      console.error('Failed to hash password:', error);
      await db('users').where('username', username).del();
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (err) {
    return res.status(409).json({ error: 'Username is already taken' });
  }
});

app.put('/detected', (req, res) => {
  const { username, facesDetected } = req.body;
  const reqUser = database.users.find(user => user.username === username);
  if (reqUser) {
    reqUser.facesDetected += facesDetected;
    res.json(reqUser);
  } else res.status(400).send('No such user');
});

app.listen(3000);
