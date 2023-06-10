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
  .from('users')
  .then(data => console.log(data));

class User {
  static createdCount = 0;
  constructor(name, passHash) {
    this.id = (++User.createdCount).toString().padStart(8, '0');
    this.name = name;
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
  const name = req.params.user;
  const reqUser = database.users.find(user => user.name === name);

  if (reqUser) res.json(reqUser);
  else res.status(404).json("The requested user doesn't exist.");
});

app.post('/signin', async (req, res) => {
  const { name, password } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (!reqUser) return res.status(400).json('Wrong user and/or password');

  const hashVerified = await argon2.verify(reqUser?.passHash, password);
  if (hashVerified) res.json({ status: 'Success', object: reqUser });
  else res.status(400).json('Wrong Password');
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;

  if (database.users.some(item => item.name === name))
    res.status(409).json({ error: 'Username is already taken' });
  else {
    try {
      const passHash = await argon2.hash(password);
      const newUser = new User(name, passHash);
      database.users.push(newUser);
      res.json({ message: 'Registration successful' });
    } catch {
      console.error('Failed to hash password:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.put('/detected', (req, res) => {
  const { name, facesDetected } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (reqUser) {
    reqUser.facesDetected += facesDetected;
    res.json(reqUser);
  } else res.status(400).send('No such user');
});

app.listen(3000);
